from celery import Celery
from .config import settings

print("Celery will connect to:", settings.REDIS_URL)

celery = Celery(
    "dsa_with_ai",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery.conf.task_serializer = "json"
celery.conf.result_serializer = "json"
celery.conf.accept_content = ["json"]
