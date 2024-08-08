from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Gesture(db.Model):
    """
    Gesture Model
    """
    __tablename__ = "gestures"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, unique=True, nullable=False)
    number_of_samples = db.Column(db.Integer, nullable=False)
    samples = db.relationship("GestureSample", cascade="delete", back_populates="gesture")

    def __init__(self, **kwargs):
        """
        Initialize a Gesture Object
        """
        self.name = kwargs.get("name", "")
        self.number_of_samples = kwargs.get("number_of_samples", 0)

    def serialize(self):
        """
        Serialize a Gesture Object
        """
        return {
            "id": self.id,
            "name": self.name,
            "number_of_samples": self.number_of_samples,
            "samples": [s.simple_serialize() for s in self.samples]
        }

    def simple_serialize(self):
        """
        Serialize a Gesture Object without samples field
        """
        return {
            "id": self.id,
            "name": self.name,
            "number_of_samples": self.number_of_samples
        }

class GestureSample(db.Model):
    """
    GestureSample Model
    """
    __tablename__ = "gesture_samples"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    gesture_id = db.Column(db.Integer, db.ForeignKey("gestures.id"), nullable=False)
    file_path = db.Column(db.String, nullable=False)
    gesture = db.relationship("Gesture", back_populates="samples")

    def __init__(self, **kwargs):
        """
        Initialize a GestureSample Object
        """
        self.gesture_id = kwargs.get("gesture_id", "")
        self.file_path = kwargs.get("file_path", "")

    def serialize(self):
        """
        Serialize a GestureSample Object
        """
        return {
            "id": self.id,
            "gesture_id": self.gesture_id,
            "file_path": self.file_path
        }

    def simple_serialize(self):
        """
        Serialize a GestureSample Object without gesture field
        """
        return {
            "id": self.id,
            "file_path": self.file_path
        }

# Database setup
def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()

def add_gesture(name, number_of_samples):
    gesture = Gesture(name=name, number_of_samples=number_of_samples)
    db.session.add(gesture)
    db.session.commit()
    return gesture.id

def add_gesture_sample(gesture_id, file_path):
    sample = GestureSample(gesture_id=gesture_id, file_path=file_path)
    db.session.add(sample)
    db.session.commit()

def get_gesture_by_name(name):
    return Gesture.query.filter_by(name=name).first()

def get_all_gestures():
    return Gesture.query.all()

def get_samples_for_gesture(gesture_id):
    gesture = Gesture.query.get(gesture_id)
    return gesture.samples if gesture else []

def increment_count(gesture_obj):
    """
    Increment the count of number of samples for the given gesture object.
    """
    gesture_obj.number_of_samples += 1
    db.session.commit()

def change_count(gesture_obj, change : int):
    """
    Increment the count of number of samples for the given gesture object.
    """
    gesture_obj.number_of_samples += change
    db.session.commit()

def get_file_paths_for_gesture(gesture_name):
    """
    Get a list of file paths for all samples of a particular gesture.
    """
    gesture = Gesture.query.filter_by(name=gesture_name).first()
    if gesture:
        return [sample.file_path for sample in GestureSample.query.filter_by(gesture_id=gesture.id).all()]
    return []

def delete_gesture_by_name(name):
    """
    Delete a gesture and all its associated samples by name.
    """
    gesture = Gesture.query.filter_by(name=name).first()
    if gesture:
        # Delete all associated samples
        GestureSample.query.filter_by(gesture_id=gesture.id).delete()
        # Delete the gesture itself
        db.session.delete(gesture)
        db.session.commit()
        return True
    return False

