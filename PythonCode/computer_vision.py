#later edit in your own expiry days for your fruits -Don
fruit_expiry_days = {
    "Mango_Overripe": 1,
    "Mango_Ripe": 5,
    "Mango_Unripe": 8,
    "Pineapple_Overripe": 1,
    "Pineapple_Ripe": 4,
    "Pineapple_Unripe": 3,
    "Apple_Overripe": 1,
    "Apple_Ripe": 1,
    "Apple_Unripe": 1
    
}

#place the output of computer machine model in this function to extract fruit name and days till expiry -Don
def ExtractFruit_Class(results):
 for fruit_class in fruit_expiry_days:
    if fruit_class in results:
       
        return fruit_class, fruit_expiry_days[fruit_class]
 print("No matching fruit class found")


results="... Mango_Overripe ..."
fruit_class, fruit_expiry_days=ExtractFruit_Class(results)
print(fruit_class)
print(fruit_expiry_days)