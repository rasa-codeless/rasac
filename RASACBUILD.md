# Building RASAC from scratch

To build and upload the RASAC package to PyPI or TestPyPI, follow the below steps.

- Navigate to `cli_seetm` where the `setup.py` is located
- Build package using wheel: `python setup.py sdist bdist_wheel`
- To install an editable package locally (for development): `pip install --editable . `
- Make sure Twine is installed in order to push to a package index. `pip install twine`
- **Upload using twine [Test PyPI]**: `twine upload --repository-url https://test.pypi.org/legacy/ dist/* `
- **Upload using twine [PyPI]**: `twine upload dist/*` [for pypi]
- Grab the link from PyPI and install using `pip install rasac==x.x.x`


