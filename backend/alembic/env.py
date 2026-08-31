from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

from app.core.config import settings
from app.core.db import Base
import app.models  # noqa: F401  ensure all models are registered on Base.metadata

config = context.config

# NOTE: deliberately NOT routed through config.set_main_option(), which
# stores the value in a configparser.ConfigParser -- that parser treats
# "%" as the start of interpolation syntax, and a real-world DATABASE_URL
# routinely contains a URL-encoded "%" (e.g. a password with "#" -> "%23"),
# which raises "invalid interpolation syntax". Keep the URL out of that
# parser entirely and pass it straight to SQLAlchemy instead.
DATABASE_URL = settings.DATABASE_URL

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(DATABASE_URL, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
