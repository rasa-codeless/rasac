from flask import Blueprint

blueprint = Blueprint(
    'rasac_blueprint',
    __name__,
    url_prefix='/api/rasac',
    static_folder='static',
    template_folder='templates',
)
