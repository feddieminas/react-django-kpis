# Generated by Django 3.2.15 on 2022-11-26 09:28

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bunit', models.CharField(max_length=50, unique=True)),
                ('description', models.CharField(blank=True, default=None, max_length=255, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='KPI',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('kpiName', models.CharField(max_length=255)),
                ('subKpiCategoryOne', models.CharField(blank=True, max_length=255, null=True)),
                ('subKpiCategoryTwo', models.CharField(blank=True, max_length=255, null=True)),
                ('amount', models.DecimalField(decimal_places=3, default=0.0, max_digits=13)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('category', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='bunits', to='api.category')),
                ('owner', models.ForeignKey(default=1, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-updated', '-created'],
                'unique_together': {('category', 'kpiName')},
            },
        ),
    ]
