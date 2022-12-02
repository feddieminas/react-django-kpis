###from django.test import TestCase
import os
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Category, KPI
from api.serializers import RegisterSerializer
from decimal import Decimal
from datetime import datetime

"""
# Plan B
if os.path.exists(f"{os.getcwd()}/env.py"): #\\env.py in windows
    import env
"""

class KPITests(APITestCase):
    access = None
    refresh = None

    def setUp(self):
        self.admin = User.objects.create_superuser('testadmin', 'testadmin@example.com', 'testadminpass')
        testuser_serializer_data = {"username": "testuser","password": "testpassword",
        "password2": "testpassword","password3": os.environ.get('password3'),"email": "testuser@example.com"}
        rserializer = RegisterSerializer(data=testuser_serializer_data)
        rserializer_valid = rserializer.is_valid()
        rserializer.save()
        if User.objects.get(id=2): self.testuser = testuser_serializer_data
        self.headers = {'Content': 'application/json'}

    def test_register(self):
        url = reverse('api:user_register')
        body = {
            "username": "testuser3",
            "password": "testpassword3",
            "password2": "testpassword3",
            "password3": os.environ.get('password3'),
            "email": "testuser3@example.com"
        }
        response = self.client.post(url, body, headers=self.headers, format='json')
        response_data = response.data
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(int(response_data['id']), 3) #means two users have been created now, hence admin and testuser

        ##### fail to register new user already exist #####
        response = self.client.post(url, body, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(response.json()["username"][0] == "A user with that username already exists.")

        ##### password raise validation error #####
        body["username"] = "testuser4"
        body["password3"] = "wrongp3"
        body["email"] = "testuser4@example.com"
        response = self.client.post(url, body, headers=self.headers, format='json')
        self.assertEqual(response.json()['password'][0], 'Password3 is incorrect')


    def test_1_login(self):
        url = reverse('api:token_obtain_pair')
        body = {
            "username": self.testuser['username'],
            "password": self.testuser['password']
        }
        response = self.client.post(url, body, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)
        self.assertTrue('refresh' in response.data)
        KPITests.access = response.data['access']
        KPITests.refresh = response.data['refresh']

        ##### test that you are logged in using the url that prints Authenticated YES #####
        url = reverse('api:is_logged_in')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + KPITests.access)
        response = self.client.get(url, headers=self.headers, format='json')
        self.assertEqual(response.data['Authenticated'], 'YES')

    def test_2_logged_categories_and_kpis(self):
        """""""""""
        CATEGORIES
        """""""""""

        ##### no user apart from admin is possible to perform action on categories create #####
        url = reverse('api:post_categories')
        body = [
            {
                "bunit": "testCategory1",
                "description": "some desc 1"
            },
            {
                "bunit": "testCategory2",
                "description": "some desc 2"
            },
            {
                "bunit": "testCategory3",
                "description": "some desc 3"
            }
        ]
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + KPITests.access)
        response = self.client.post(url, body, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        #### login as admin and create category, one or more than one ####
        response = self.client.post(
            reverse('api:token_obtain_pair'), {
                    "username": 'testadmin', "password": 'testadminpass'}, headers=self.headers, format='json')
        access_admin = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_admin)
        response = self.client.post(url, body, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('some desc 2' in response.data[1]['description'])

        #### get categories ####
        url = reverse('api:get_categories')
        response = self.client.get(url, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.json()) == Category.objects.count())

        #### put category ####
        url = reverse('api:get_put_delete_category', kwargs={'pk': 1})
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_admin)
        body = {
                "bunit": "testCategory1b",
                "description": "some desc 1b"
                }
        response = self.client.put(url, body, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        #### get category ####
        response = self.client.get(url, headers=self.headers, format='json')
        self.assertEqual(int(response.data['id']), 1)
        self.assertEqual(response.data['bunit'], "testCategory1b")
        self.assertEqual(response.data['description'], "some desc 1b")

        #### delete category ####
        response = self.client.delete(url, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("testCategory1b was deleted!" in response.json())

        #### get category not existent ####
        response = self.client.get(url, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        """""""""""
        KPIS
        """""""""""

        #### prev logged as user and create kpi, one or more than one ####
        url = reverse('api:post_kpis')
        body = [
            {
                "category": "testCategory3",
                "kpiName": "test3kpiName",
                "subKpiCategoryOne": "test3subKpiCategoryOne",
                "subKpiCategoryTwo": "test3subKpiCategoryTwo",
                "amount": Decimal(1200)
            },
            {
                "category": "testCategory2",
                "kpiName": "test2kpiName",
                "subKpiCategoryOne": "test2subKpiCategoryOne",
                "subKpiCategoryTwo": "test2subKpiCategoryTwo",
                "amount": Decimal(1354.459)
            },
            {
                "category": "testCategory2",
                "kpiName": "testAnotherkpiName",
                "amount": Decimal(1000000000.134)
            },
            {
                "category": "testCategory3",
                "kpiName": "testAnotherkpiName3",
                "subKpiCategoryOne": "test2subKpiCategoryOne",
                "amount": Decimal(-1234567891.450)
            }
        ]
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + KPITests.access) ## will handle all subsequent requests, that needs auth. it kepts thru self.client, class itself
        response = self.client.post(url, body, headers=self.headers, format='json')
        self.assertIsInstance(response.json()[0]['amount'], float)
        self.assertIsInstance(response.json()[1]['amount'], float)
        self.assertIsInstance(response.json()[2]['amount'], float)
        self.assertTrue(len(response.json()) == KPI.objects.count())

        #### user creates kpi, unique together constraint raises as same combination of category and kpiname is posted again ####
        body = [
            {
                "category": "testCategory3",
                "kpiName": "test3kpiName",
                "subKpiCategoryOne": "",
                "subKpiCategoryTwo": "",
                "amount": Decimal(1200.01)
            }
        ]
        #self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + KPITests.access)
        response = self.client.post(url, body, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_208_ALREADY_REPORTED)
        self.assertEqual(response.json()[0]['non_field_errors'][0], 'The fields category, kpiName must make a unique set.')

        #### get kpis ####
        url = reverse('api:get_kpis')
        response = self.client.get(url, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.json()) == KPI.objects.count())

        #### put kpi ####
        url = reverse('api:get_put_delete_kpi', kwargs={'pk': 1})
        #self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + KPITests.access)
        body = {
                "category": "testCategory3",
                "kpiName": "test3kpiName",
                "subKpiCategoryOne": "",
                "subKpiCategoryTwo": "",
                "amount": Decimal(1200.01)
            }
        response = self.client.put(url, body, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        #### get kpi ####
        response = self.client.get(url, headers=self.headers, format='json')
        self.assertEqual(Decimal(response.data['amount']), Decimal('1200.01'))
        self.assertEqual(response.data['subKpiCategoryOne'], "")
        self.assertEqual(response.data['subKpiCategoryTwo'], "")

        #### delete kpi ####
        response = self.client.delete(url, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(f"test3kpiName - 1200.010 was deleted!" in response.json())

        #### get kpi not existent ####
        response = self.client.get(url, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        #### kpi search. we have a q and/or a time parameter to search ####
        url = reverse("api:get_kpis_search")
        ## check last hour. we use the time parameter with integer (ex. hour). should retrieve all results now ##
        response = self.client.get(url, {'time': '1'}, headers=self.headers, format='json')
        self.assertTrue(len(response.json()) == KPI.objects.count())
        ## check date. we use the today's date ##
        dt = datetime.today().strftime('%Y-%m-%d')
        response = self.client.get(url, {'q': dt}, headers=self.headers, format='json')
        self.assertTrue(len(response.json()) == KPI.objects.count())
        ## check string. we insert the text test2subKpiCategoryOne and should result to two records ##
        response = self.client.get(url, {'q': 'test2subKpiCategoryOne'}, headers=self.headers, format='json')
        self.assertTrue(len(response.json()) == 2)
        ## check amount. we insert 1354.135 as amount. Should retrieve the first record ## 
        response = self.client.get(url, {'q': 1354.135}, headers=self.headers, format='json')
        self.assertTrue(response.data[0]["kpiName"] == "test2kpiName")


    def test_3_login_refresh(self):
        url = reverse('api:token_refresh')
        body = {"refresh": KPITests.refresh}
        response = self.client.post(url, body, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)
        self.assertTrue('refresh' in response.data)
        KPITests.access = response.data['access']
        KPITests.refresh = response.data['refresh']

        #check that you cannot use again the old refresh token
        response = self.client.post(url, body, headers=self.headers, format='json')
        self.assertEqual(response.data['detail'], 'Token is blacklisted')


    def test_4_logout(self):
        url = reverse('api:token_logout')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + KPITests.access)
        body = {"refresh_token": KPITests.refresh}
        response = self.client.post(url, body, headers=self.headers, format='json')
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

        # check that you cannot use again the old refresh token
        url = reverse('api:token_refresh')
        body = {"refresh": KPITests.refresh}
        response = self.client.post(url, body, headers=self.headers, format='json')
        self.assertEqual(response.data['detail'], 'Token is blacklisted')