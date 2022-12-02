import os
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
################
from api.models import Category, KPI
################

"""
# Plan B
if os.path.exists(f"{os.getcwd()}/env.py"): #\\env.py in windows
    import env
"""

"""
https://medium.com/django-rest/django-rest-framework-login-and-register-user-fd91cf6029d5
https://stackoverflow.com/questions/66667277/django-how-to-validate-if-a-user-already-exists
"""

"""
User Registration
"""
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
            required=True,
            validators=[UniqueValidator(queryset=User.objects.all())]
            )

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    password3 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id','username', 'password', 'password2', 'password3', 'email')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False}
        }
        read_only_fields = ('id',)


    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def validate(self, attrs): #def validate(self, attrs) for all fields, def validate_password3(self, value) for single field
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        if attrs['password3'] != os.environ.get('password3'):
            raise serializers.ValidationError({"password": "Password3 is incorrect"})
        return attrs

    def create(self, validated_data):

        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            id=User.objects.count()+1
        )
        user.set_password(validated_data['password'])
        user.save()

        return user

"""
Category Registration
"""
class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = '__all__'
        extra_kwargs = {
            'description': {'required': False}
        }

    def validate(self, attrs):
        if Category.objects.filter(bunit=attrs['bunit']).count():
            raise serializers.ValidationError({"bunit already exists"})
        return attrs

    def create(self, validated_data):

        category = Category.objects.create(
            bunit=validated_data['bunit'],
            description=validated_data.get('description', None),
            id=Category.objects.count()+1
        )
        category.save()

        return category


"""
KPI Registration
"""
class KPISerializer(serializers.ModelSerializer):

    #we need the SlugRelatedField (slug_field='bunit') to relate the one part field of the relationship
    category = serializers.SlugRelatedField(
        many=False,
        slug_field='bunit',
        queryset=Category.objects.all()
    )

    class Meta:
        model = KPI
        fields = ('id', 'category', 'kpiName','subKpiCategoryOne','subKpiCategoryTwo','amount','updated','created')
        extra_kwargs = {
            'subKpiCategoryOne': {'required': False},
            'subKpiCategoryTwo': {'required': False},
            'updated': {'required': False},
            'created': {'required': False}
        }

    def validate_category(self, value): #not needed but keep there
        if not Category.objects.filter(bunit=value).exists():
            raise serializers.ValidationError(f"{value} has to be register on Category table by admin !")
        return value

    def validate_amount(self, value):
        try:
            value = float(value)
        except ValueError:
            raise serializers.ValidationError(f"{value} is not numerical")
        return value

    def create(self, validated_data):
        request = self.context.get("request")

        kpi = KPI.objects.create(
            category=Category.objects.get(bunit=validated_data['category']),
            owner=request.user,
            kpiName=validated_data['kpiName'],
            subKpiCategoryOne=validated_data.get('subKpiCategoryOne', None),
            subKpiCategoryTwo=validated_data.get('subKpiCategoryTwo', None),
            amount=validated_data['amount'],
            id=KPI.objects.count() + 1
        )
        kpi.save()

        return kpi

    def update(self, instance, validated_data):
        instance.category = validated_data.get('category', instance.category)
        request = self.context.get("request")
        instance.kpiName = validated_data.get('kpiName', instance.kpiName)
        instance.subKpiCategoryOne = validated_data.get('subKpiCategoryOne', instance.subKpiCategoryOne)
        instance.subKpiCategoryTwo = validated_data.get('subKpiCategoryTwo', instance.subKpiCategoryTwo)
        instance.amount = validated_data.get('amount', instance.amount)
        instance.save()
        return instance

    def to_representation(self, instance): #when user retrieve records from the api, add extra field the owner
        representation = super().to_representation(instance)
        representation['owner'] = instance.owner.username
        return representation