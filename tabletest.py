app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get('DATABASE_URL', "")  or "sqlite:///db/bellybutton.sqlite"
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)
print(Base.classes.keys())