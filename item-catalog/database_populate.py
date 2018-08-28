
from database_setup import Category, Item, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine('sqlite:///catalog.db')

Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()




#Populate Categories
soccer = Category(name = "soccer", description = "Kick some butt on the field with this gear")
session.add(soccer)

basketball = Category(name = "basketball", description = "To help you go hard to the hoop")
session.add(basketball)

baseball = Category(name = "baseball", description = "Everything you need to make your next game a homerun")
session.add(baseball)


frisbee = Category(name = "frisbee", description = "Improve your game with our equipment")
session.add(frisbee)


snowboarding = Category(name = "snowboarding", description = "The coolest gear to help you tackle the mountain")
session.add(snowboarding)


rock_climbing = Category(name = "climbing", description = "Gear to get you to new heights")
session.add(rock_climbing)


football = Category(name = "football", description = "You won't disappoint your team with this gear")
session.add(football)


skating = Category(name = "skating", description = "Everything you need for your finest performance")
session.add(skating)


hockey = Category(name = "hockey", description = "All the protection you need to keep you safe")
session.add(hockey)

session.commit()



#Populate Items
cleats = Item(name = "cleats", description = "Maintain control of the ball with these padded cleats for extra comfort", category_id = 1, created_by_user = "102017630495928835049")
soccerball = Item(name = "soccer ball", description = "10 inch ball for the best in control", category_id = 1, created_by_user = "102017630495928835050")
session.add(cleats)
session.add(soccerball)

hoop = Item(name = "basketball hoop", description = "Portable hoop with 60 inch backboard", category_id = 2, created_by_user = "102017630495928835049")
basketball = Item(name = "basketball", description = "Youth 28.5 inch ball", category_id = 2, created_by_user = "102017630495928835049")
session.add(hoop)
session.add(basketball)

baseball = Item(name = "baseball", description = "9 inch hollow core ball", category_id = 3, created_by_user = "102017630495928835049")
bat = Item(name = "bat", description = "Maple wood composite bat", category_id = 3, created_by_user = "102017630495928835049")
session.add(baseball)
session.add(bat)

session.commit()


frisbee = Item(name = "frisbee", description = "175 gram Ultimate frisbee", category_id = 4, created_by_user = "102017630495928835049")
frisbee_glove = Item(name = "frisbee glove", description = "Gloves for handling and catching", category_id = 4, created_by_user = "102017630495928835049")
session.add(frisbee)
session.add(frisbee_glove)

snowboard = Item(name = "snowboard", description = "Womens 147cm board", category_id = 5, created_by_user = "102017630495928835049")
goggles = Item(name = "goggles", description = "Womens anti-fog goggles with mirrored lenses", category_id = 5, created_by_user = "102017630495928835049")
session.add(snowboard)
session.add(goggles)

chalk = Item(name = "hand chalk", description = "Chalk to improve your grip", category_id = 6, created_by_user = "102017630495928835049")
rope = Item(name = "rope", description = "Dynamic rope for maximum elasticity", category_id = 6, created_by_user = "102017630495928835049")
session.add(chalk)
session.add(rope)

session.commit()


football = Item(name = "football", description = "Laceless training football", category_id = 7, created_by_user = "102017630495928835049")
tackling_dummy = Item(name = "tackling dummy", description = "Moving football tackling dummy", category_id = 7, created_by_user = "102017630495928835049")
session.add(football)
session.add(tackling_dummy)

blade_covers = Item(name = "blade covers", description = "Protect your skate blades off of the ice", category_id = 8, created_by_user = "102017630495928835050")
skates = Item(name = "skates", description = "Youth Freestyle Skates", category_id = 8, created_by_user = "102017630495928835049")
session.add(blade_covers)
session.add(skates)

helmet = Item(name = "helmet", description = "Four piece shell and liner", category_id = 9, created_by_user = "102017630495928835049")
mouth_guard = Item(name = "mouth guard", description = "Green mouthguard with strap", category_id = 9, created_by_user = "102017630495928835049")
session.add(helmet)
session.add(mouth_guard)

session.commit()


print "added catalog items!"
