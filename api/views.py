import os

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .custom_permissions import IsOwnerOrAdmin

from django.contrib.auth.models import User
from api.models import Category, KPI
from django.core.exceptions import ObjectDoesNotExist
from .serializers import RegisterSerializer, CategorySerializer, KPISerializer

from django.db.models import Q
from datetime import datetime, timedelta
from django.utils import timezone
import re

"""
# Plan B
if os.path.exists(f"{os.getcwd()}/env.py"): #\\env.py in windows
    import env
"""

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['password3'] = os.environ.get('password3')
        # ...

        return token

    
"""
EndPoint: /api/login/
"""
class MyTokenObtainPairView(TokenObtainPairView):
    #permission_classes = (AllowAny,)
    serializer_class = MyTokenObtainPairSerializer


@api_view(['GET'])
def getRoutes(request):
    routes = [
        {
            'Endpoint': '/api/register',
            'headers': {'Content-Type': 'application/json'},
            'method': 'POST',
            'body': {'username': 'my username', 'password': 'my password', 'password2': 'my confirm password',
                     'password3': 'my secret org. password', 'email': 'my email'},
            'description': 'create a user organization account to retrieve records'
        },
        {
            'Endpoint': '/api/login',
            'headers': {'Content-Type': 'application/json'},
            'method': 'POST',
            'body': {'username': 'my username', 'password': 'my password'},
            'description': 'create a user organization account to retrieve records. keep access token and refresh token from the output'
        },
        {
            'Endpoint': '/api/login/refresh',
            'headers': {'Content-Type': 'application/json'},
            'method': 'POST',
            'body': {'refresh': 'my refresh token'},
            'description': 'create a new access token from the refresh token you retrieved from the login url' 
        },
        {
            'Endpoint': '/api/logout',
            'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer access_token'},
            'method': 'POST',
            'body': {'refresh_token': 'my refresh token'},
            'description': 'logout from the user organization account'
        },
        {
            'Endpoint': '/api/isloggedIn',
            'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer access_token'},
            'method': 'GET',
            'body': "",
            'description': 'if want to just test that you are logged in'
        },
        {
            'Endpoint': '/api/categories',
            'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer access_token'},
            'method': 'GET',
            'body': "",
            'description': 'Retrieve the categories.'
        },
        {
            'Endpoint': '/api/categories/create',
            'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer access_token'},
            'method': 'POST',
            'body': [{"bunit": "string", "description": "optional string"}],
            'description': 'Create one or more categories. Only admin user'
        },
        {
            'Endpoint': '/api/categories/<str:pk>',
            'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer access_token'},
            'method': 'GET',
            'body': "",
            'description': 'List a category. Only admin user'
        },
        {
            'Endpoint': '/api/categories/<str:pk>',
            'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer access_token'},
            'method': 'PUT',
            'body': {"bunit": "string", "description": "optional string"},
            'description': 'Update the category. Only admin user'
        },
        {
            'Endpoint': '/api/categories/<str:pk>',
            'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer access_token'},
            'method': 'DELETE',
            'body': "",
            'description': 'Delete the category. Only admin user'
        },
        {
            'Endpoint': '/api/kpis',
            'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer access_token'},
            'method': 'GET',
            'body': "",
            'description': 'List the categories'
        },
        {
            'Endpoint': '/api/kpis/search/',
            'params': "q=string&time=integer",
            'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer access_token'},
            'method': 'GET',
            'body': "",
            'description': 'search kpis. can search for a string, for a date formatted in YYYY-MM-DD, or for a time to retrieve last x hours from now'
        },
        {
            'Endpoint': '/api/kpis/create',
            'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer access_token'},
            'method': 'POST',
            'body': [{"category": "string", "kpiName": "string", "subKpiCategoryOne": "optional string",
                        "subKpiCategoryTwo": "optional string", "amount": "numeric value"}],
            'description': 'Create one or more kpis'
        },
        {
            'Endpoint': '/api/kpis/<str:pk>',
            'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer access_token'},
            'method': 'GET',
            'body': "",
            'description': 'List a kpi'
        },
        {
            'Endpoint': '/api/kpis/<str:pk>',
            'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer access_token'},
            'method': 'PUT',
            'body': {"category": "string", "kpiName": "string", "subKpiCategoryOne": "optional string",
                        "subKpiCategoryTwo": "optional string", "amount": "numeric value"},
            'description': 'Update a kpi'
        },
        {
            'Endpoint': '/api/kpis/<str:pk>',
            'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer access_token'},
            'method': 'DELETE',
            'body': "",
            'description': 'Delete a kpi'
        }
    ]

    return Response(routes)


@api_view(['GET', 'POST'])
@permission_classes((AllowAny, ))
def RegisterView(request):
    if request.method == 'GET':
        queryset = User.objects.all()
        serializer = RegisterSerializer(queryset, fields=('id','username',), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


"""
https://appliku.com/post/how-use-jwt-authentication-django
"""
@api_view(['POST'])
@permission_classes((IsAuthenticated, ))
def logout_view(request):
    try:
        if request.data.get('all'):
            token = OutstandingToken()
            for token in OutstandingToken.objects.filter(user=request.user):
                _, _ = BlacklistedToken.objects.get_or_create(token=token)
            return Response({"status": "OK, goodbye, all refresh tokens blacklisted"})
        refresh_token = request.data["refresh_token"]
        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response(status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes((IsAuthenticated, ))
def example_authenticated_view(request):
    return Response({'Authenticated': 'YES'})


@api_view(['POST'])
@permission_classes(([IsAuthenticated, IsAdminUser]))
def category_create(request):
    serializer = CategorySerializer(data=request.data, many=True)
    if serializer.is_valid():
        serializer.save()
    else:
        err = serializer.errors
        return Response(err, status=status.HTTP_208_ALREADY_REPORTED)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET','PUT','DELETE'])
@permission_classes(([IsAuthenticated, IsAdminUser]))
def category_retrieve_update_delete(request, pk):
    try:
        category = Category.objects.get(id=pk)

        if request.method == 'GET':
            serializer = CategorySerializer(category, many=False)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'PUT':
            data = request.data
            serializer = CategorySerializer(instance=category, data=data)
            if serializer.is_valid():
                serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'DELETE':
            bunit = category.bunit
            category.delete()
            return Response(f'{bunit} was deleted!', status=status.HTTP_200_OK)

    except ObjectDoesNotExist:
        return Response(f"Category with pk {pk} does not exist", status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes(([IsAuthenticated]))
def category_get(request):
    categories = Category.objects.all().order_by('-id')
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


"""
KPI

Search function
Choices are: amount, category, category_id, created, id, kpiName, owner, owner_id, subKpiCategoryOne, subKpiCategoryTwo, updated
"""
@api_view(['GET'])
@permission_classes(([IsAuthenticated]))
def kpi_search(request):
    q = request.GET.get('q', None)
    time = request.GET.get('time', None)
    results = KPI.objects.none()
    err = None
    """ TIME 
    A negative integer are hours ahead
    A positive integer are hours behind

    q=2022-11-02&time=0
    time_threshold = 2022-11-01 23:00:00+00:00
    q=2022-11-02&time=1
    time_threshold = 2022-11-02 00:00:00+00:00
    q=2022-11-02&time=-1
    time_threshold = 2022-11-02 01:00:00+00:00
    """
    if time: # check time filter last x hours https://stackoverflow.com/questions/10345147/django-query-datetime-for-objects-older-than-5-hours
        try:
            time = int(time)
            if q:
                patternDate = r'^\d{4}-\d{2}-\d{2}$'
                dt = datetime.strptime(q, '%Y-%m-%d').date()
                dtyear, dtmonth, dtday = dt.year, dt.month, dt.day
                time_threshold = timezone.datetime(dtyear, dtmonth, dtday, tzinfo=timezone.get_current_timezone()) - timedelta(hours=time)
                lookups = Q(updated__gte=time_threshold)
                results = KPI.objects.filter(lookups)
            else:
                time_threshold = timezone.now() - timedelta(hours=time)
                results = KPI.objects.filter(updated__gte=time_threshold)
        except Exception as e:
            err = {"Error message": str(e)}
    """ Q """
    if q and not time:
        """ DATE """
        patternDate = r'^\d{4}-\d{2}-\d{2}$'
        dt = None
        if re.match(patternDate, q) and not results: #check date (YYYY-MM-DD) like 2022-10-31 - https://stackoverflow.com/questions/4668619/how-do-i-filter-query-objects-by-date-range-in-django
            try:
                dt = datetime.strptime(q, '%Y-%m-%d').date()
                results = KPI.objects.filter(updated__year=dt.year, updated__month=dt.month, updated__day=dt.day)
            except ValueError as e:
                err = {"Error Date message": str(e)}
        """ NORMAL LOOKUP """
        if not results and not dt:
            lookups = Q(id__icontains=q) | Q(category__bunit__icontains=q) | Q(owner__username__icontains=q) | Q(kpiName__icontains=q) | Q(subKpiCategoryOne__icontains=q) | Q(subKpiCategoryTwo__icontains=q)
            results = KPI.objects.filter(lookups)
        """ CHECK AMOUNT """
        if not results and not dt:
            try:
                q = float(q)
                lookups = ( Q(amount__gte=q-1) & Q(amount__lte=q+1) )
                results = KPI.objects.filter(lookups)
            except ValueError as e:
                err = {"Error Amount message": str(e)}

    """ FINAL RESPONSE """
    if not results:
        err = {"Error QuerySet message": "Not any results are found"}

    if err:
        return Response(err, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    else:
        serializer = KPISerializer(results, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes(([IsAuthenticated, IsOwnerOrAdmin]))
def kpi_create(request):
    serializer = KPISerializer(data=request.data, many=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
    else:
        err = serializer.errors
        return Response(err, status=status.HTTP_208_ALREADY_REPORTED)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes(([IsAuthenticated]))
def kpi_get(request):
    kpis = KPI.objects.all().order_by('-id')
    serializer = KPISerializer(kpis, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


"""
Assume we are on a team and there is no actually a sole owner, who will last update 
will actually become owner. The main thing one to be a user of this rest api
"""
@api_view(['GET','PUT','DELETE'])
@permission_classes(([IsAuthenticated]))
def kpi_retrieve_update_delete(request, pk):
    try:
        kpi = KPI.objects.get(id=pk)

        if request.method == 'GET':
            serializer = KPISerializer(kpi, many=False)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'PUT':
            data = request.data
            serializer = KPISerializer(instance=kpi, data=data)
            if serializer.is_valid():
                serializer.save(owner=request.user)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors)

        elif request.method == 'DELETE':
            kpiName = kpi.kpiName
            amount = kpi.amount
            kpi.delete()
            return Response(f'{kpiName} - {amount} was deleted!', status=status.HTTP_200_OK)

    except ObjectDoesNotExist:
        return Response(f"KPI with pk {pk} does not exist", status=status.HTTP_400_BAD_REQUEST)