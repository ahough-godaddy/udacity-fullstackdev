import os
import sys
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
from passlib.apps import custom_app_context as pwd_context
from datetime import datetime
 
Base = declarative_base()

#Table to store Category information 
class Category(Base):
    __tablename__ = 'category'
   
    id = Column(Integer, primary_key=True, unique=True)
    name = Column(String(80), nullable=False, unique=True)
    description = Column(String(250))


#Table to store Item information 
class Item(Base):
    __tablename__ = 'item'


    name =Column(String(80), nullable = False)
    id = Column(Integer, primary_key = True, unique=True)
    description = Column(String(250))
    date_added = Column(DateTime(), default=datetime.utcnow)
    created_by_user = Column(String(30), nullable=False)
    category_id = Column(Integer,ForeignKey('category.id'))
    category = relationship(Category)
    
     

    #Serialize function to be able to send Item information as JSON objects
    @property
    def serialize(self):
       
       return {
           'name'         : self.name,
           'id'         : self.id,
           'description'         : self.description,
           'date_added'     : self.date_added,
           'category_id'        : self.category_id,
           'created_by_user'   : self.created_by_user
       }
 

engine = create_engine('sqlite:///catalog.db')
 

Base.metadata.create_all(engine)