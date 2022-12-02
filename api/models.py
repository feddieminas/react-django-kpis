from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    bunit = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, default=None, null=True, blank=True)

    def __str__(self):
        return self.bunit

class KPI(models.Model):
    category = models.ForeignKey(Category, related_name='bunits', on_delete=models.CASCADE, default=1)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, default=1)
    kpiName = models.CharField(max_length=255)
    subKpiCategoryOne = models.CharField(max_length=255, null=True, blank=True)
    subKpiCategoryTwo = models.CharField(max_length=255, null=True, blank=True)
    amount = models.DecimalField(max_digits=13, decimal_places=3, default=0.000)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["category", "kpiName"]
        ordering = ['-updated', '-created']

    def __str__(self):
        return f"{self.kpiName} - {self.amount}"