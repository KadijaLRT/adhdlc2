export const GROCERY_CATEGORIES: Record<string, string[]> ={
  '\uD83E\uDD69 Proteins':['chicken','beef','lamb','fish','shrimp','crab','lobster','scallop','turkey','wagyu','salmon','tilapia','mahi','snapper','sardine','butterfish','sausage','saltfish','codfish','ackee'],
  '\uD83E\uDD6C Produce':['spinach','tomato','carrot','kale','lettuce','mushroom','pepper','onion','garlic','ginger','corn','squash','yam','potato','sweet potato','plantain','avocado','scallion','cilantro','parsley','celery','broccoli','zucchini','cabbage','bok choy','callaloo','thyme'],
  '\uD83C\uDF4E Fruits':['apple','mango','pineapple','berry','dragonfruit','coconut','lime','lemon','orange','guava','tamarind'],
  '\uD83E\uDD5A Dairy & Eggs':['egg','butter','cream','milk','cheese','parmesan','cheddar','mozzarella','sour cream','yogurt','ghee'],
  '\uD83C\uDF3E Dry & Grains':['rice','pasta','flour','oat','cornmeal','breadcrumb','noodle','tortilla','bread','cornbread','dumpling','couscous','quinoa','grits'],
  '\uD83E\uDED9 Pantry':['oil','coconut milk','broth','stock','soy sauce','worcestershire','tomato paste','tomato sauce','bbq sauce','honey','sugar','vinegar','hot sauce','fish sauce','sesame oil','curry paste','jerk','scotch bonnet','allspice'],
  '\uD83C\uDF3F Herbs & Spice':['turmeric','paprika','cumin','coriander','cinnamon','thyme','rosemary','bay leaf','oregano','basil','cayenne','seasoning','salt','pepper','allspice','cardamom','fennel','dill'],
  '\uD83E\uDD5C Nuts & Seeds':['cashew','peanut','pecan','walnut','flax','chia','sesame','almond'],
};
export function catItem(it){const l=it.toLowerCase();for(const[c,kws]of Object.entries(GKW)){if(kws.some(k=>l.includes(k)))return c;}return '\uD83D\uDCE6 Other';}

// Builds a de-duplicated grocery list from a week's meal plan, using each recipe's
// ingredient group tags. Used by both the meal Plan screen and the Shop screen.
export function buildGroceryFromPlan(plan, recipeDb) {
  if (!plan) return [];
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const MEAL_TYPES = ['breakfast','lunch','dinner','snack'];
  const map = {};
  DAYS.forEach(day => {
    MEAL_TYPES.forEach(type => {
      const rid = plan[day]?.[type];
      if (rid) {
        const rec = recipeDb.find(r => r.id === rid);
        if (rec) {
          rec.g.forEach(item => {
            const k = item.toLowerCase();
            if (!map[k]) map[k] = { name: item, cat: catItem(item), id: k + '_plan' };
          });
        }
      }
    });
  });
  return Object.values(map);
}
