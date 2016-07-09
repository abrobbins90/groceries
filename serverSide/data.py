# This module is for loading and saving data (like ingredients and meals)

def load():
	""" read the data """
	with open("meals.csv", "r") as file:
		data = file.read()
	return data

def add_meal(meal):
	""" append a meal to the data """
	meal_csv = convert_to_string(meal)
	with open("meals.csv", "w+") as file:
		file.write(meal_csv)

def remove_meal(meal):
	pass

def overwrite_meal(meal):
	pass



