import logging
import sys
from setuptools import (
    setup,
    find_packages,
)
from rasa_codeless.shared.constants import (
    PACKAGE_NAME,
    PACKAGE_VERSION
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

if sys.version_info < (3, 7) or sys.version_info >= (3, 9):
    sys.exit('Rasa-Codeless requires Python 3.7 or 3.8')

requirements = None
long_description = None

try:
    with open("README.md", mode="r", encoding="utf8") as readme_file:
        long_description = readme_file.read()

    with open("requirements.txt", mode="r", encoding="utf8") as requirements_file:
        requirements = requirements_file.readlines()
    requirements = [str.strip(req) for req in requirements]

except Exception as e:
    long_description = "not provided"
    logger.error(f"couldn't retrieve the long "
                 f"package description. {e}")

setup(
    name=PACKAGE_NAME,
    version=PACKAGE_VERSION,
    packages=find_packages(),
    include_package_data=True,
    package_data={
        # Include special files needed
        # for init project:
        "": [
            "frontend/*",
            "frontend/res/*",
            "frontend/res/images/*",
            "frontend/res/scripts/*",
            "frontend/res/styles/*",
            "frontend/static/*",
            "frontend/static/css/*",
            "frontend/static/js/*",
            "frontend/static/media/*",
            "static/*",
            "templates/*",
            "*.env",
            "*.md",
            "*.js",
            "*.css",
            "*.png",
            "*.py",
            "__init__.py",
            "*.yml",
        ],
    },
    description="A GUI for NLU pipeline configurations and model training for Rasa Conversational AIs.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/rasa-codeless/rasac",
    author="Shamikh Hameed",
    author_email="shamikhhameed@gmail.com",
    license='Apache License 2.0',
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Environment :: Console",
        "Environment :: GPU",
        "Framework :: Flask",
        "Intended Audience :: Developers",
        "Intended Audience :: Education",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: Apache Software License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    install_requires=requirements or [
        'rasa~=2.8.8',
        'flask~=2.0.3',
        'werkzeug~=2.0.3',
        'requests~=2.27.1',
        'setuptools~=58.0.4',
        'flask-cors~=3.0.10',
    ],
    entry_points={'console_scripts': ['rasac = rasa_codeless.rasa_codeless:run_rasac']}
)

