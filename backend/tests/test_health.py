import os

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"

from app.main import health_check


def test_health_check():
    assert health_check() == {"status": "ok"}
