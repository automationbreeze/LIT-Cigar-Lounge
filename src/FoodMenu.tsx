import React from 'react';
import './FoodMenu.css';

const menuData = {
  "restaurant": "Lit Kitchen (Pittsburgh Lit Cigar Lounge)",
  "kitchen_hours": {
    "Tues-Thurs": "6pm-11pm",
    "Fri-Sat": "6pm-1am"
  },
  "menu": {
    "Small Bites": {
      "items": [
        {
          "name": "Sample Platter",
          "price": 25.00,
          "description": "(Pick 4) Options: Onion Rings, Mozerella Sticks, Fried Zucchini, Chicken Tenders, French Fries"
        },
        {
          "name": "Tenders With Fries",
          "price": 10.00
        },
        {
          "name": "Shrimp With Fries",
          "price": 15.00
        },
        {
          "name": "Small Salad",
          "price": 6.00
        }
      ]
    },
    "Sandwiches": {
      "items": [
        {
          "name": "Hamburger",
          "price": 10.00
        },
        {
          "name": "Fish Sandwich",
          "price": 10.00
        },
        {
          "name": "Grilled Chicken",
          "price": 10.00
        },
        {
          "name": "Black Bean Burger",
          "price": 10.00,
          "description": "Served on Ciabatta Roll"
        }
      ],
      "add_ons": [
        {
          "name": "Add Cheese",
          "price": 1.00
        },
        {
          "name": "Add Fries",
          "price": 3.00
        },
        {
          "name": "Add Fries w/ Cheese Sauce",
          "price": 5.00
        }
      ]
    },
    "Wings": {
      "items": [
        { "name": "4 Wings", "price": 7.49 },
        { "name": "5 Wings", "price": 9.63 },
        { "name": "6 Wings", "price": 11.77 },
        { "name": "7 Wings", "price": 13.91 },
        { "name": "8 Wings", "price": 14.98 },
        { "name": "9 Wings", "price": 16.03 },
        { "name": "10 Wings", "price": 17.12 },
        { "name": "11 Wings", "price": 18.19 },
        { "name": "12 Wings", "price": 20.33 }
      ],
      "flavors": [
        "Teriyaki",
        "Garlic Parmesan",
        "Honey Hot BBQ",
        "Buffalo Garlic Parmesan",
        "Orange Spicy",
        "Cherry Bomb",
        "Sweet Chili",
        "Buffalo Lemon"
      ],
      "notes": "Flavors +$1.00"
    },
    "Sides": {
      "items": [
        { "name": "Potato Salad", "price": 4.50 },
        { "name": "Linguini", "price": 4.50 },
        { "name": "Yellow Rice", "price": 4.50 },
        { "name": "Asparagus", "price": 4.50 },
        { "name": "Fresh Green Beans", "price": 4.50 },
        { "name": "French Fries", "price": 3.50 },
        { "name": "Cheese Fries", "price": 5.50 }
      ]
    },
    "Salads": {
      "base_ingredients": "All salads come with: Lettuce, tomato, onion, cucumber, cheese, and croutons",
      "items": [
        { "name": "Grilled Chicken", "price": 14.00 },
        { "name": "Fried Chicken", "price": 14.00 },
        { "name": "Salmon", "price": 17.00 },
        { "name": "Grilled Shrimp", "price": 17.00 },
        { "name": "Fried Shrimp", "price": 17.00 },
        { "name": "Steak", "price": 22.50 }
      ],
      "add_ons": [
        { "name": "Add Egg", "price": 1.00 },
        { "name": "Extra Dressing", "price": 1.00 }
      ],
      "dressings": [
        "Ranch",
        "Blue Cheese",
        "Italian",
        "California French",
        "French"
      ]
    },
    "Special Menus": {
      "Taco Tuesday": {
        "description": "Offering Tacos and Different Specials Every Tuesday"
      },
      "Friday & Saturday": {
        "time": "Served from 6pm-11pm",
        "description": "All dinners are served with 2 sides",
        "items": [
          { "name": "Salmon", "price": 22.50 },
          { "name": "Steak", "price": 28.00 },
          { "name": "1 Lobster Tail", "price": 27.00 },
          { "name": "2 Lobster Tails", "price": 45.00 },
          { "name": "Surf N' Turf", "price": 45.00 }
        ]
      }
    }
  }
};

const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

export default function FoodMenu() {
  return (
    <div className="food-menu-container">
      <div className="food-menu-header">
        <h1 className="food-menu-title">Menu</h1>
        <p className="food-menu-subtitle">{menuData.restaurant}</p>
        <div className="food-menu-hours">
          <p>Kitchen Hours:</p>
          {Object.entries(menuData.kitchen_hours).map(([days, hours]) => (
            <p key={days}>{days}: {hours}</p>
          ))}
        </div>
      </div>

      <div className="food-menu-grid">
        {/* Small Bites */}
        <div className="menu-category">
          <h2 className="menu-category-title">Small Bites</h2>
          {menuData.menu["Small Bites"].items.map((item, index) => (
            <div key={index}>
              <div className="menu-item">
                <span className="menu-item-name">{item.name}</span>
                <span className="menu-item-price">{formatPrice(item.price)}</span>
              </div>
              {item.description && <p className="menu-item-description">{item.description}</p>}
            </div>
          ))}
        </div>

        {/* Sandwiches */}
        <div className="menu-category">
          <h2 className="menu-category-title">Sandwiches</h2>
          {menuData.menu.Sandwiches.items.map((item, index) => (
            <div key={index}>
              <div className="menu-item">
                <span className="menu-item-name">{item.name}</span>
                <span className="menu-item-price">{formatPrice(item.price)}</span>
              </div>
              {item.description && <p className="menu-item-description">{item.description}</p>}
            </div>
          ))}
          
          <div className="menu-addons">
            <h3 className="menu-addons-title">Add Ons</h3>
            {menuData.menu.Sandwiches.add_ons.map((addon, index) => (
              <div key={index} className="menu-addon-item">
                <span>{addon.name}</span>
                <span>+{formatPrice(addon.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wings */}
        <div className="menu-category">
          <h2 className="menu-category-title">Wings</h2>
          {menuData.menu.Wings.items.map((item, index) => (
            <div key={index} className="menu-item">
              <span className="menu-item-name">{item.name}</span>
              <span className="menu-item-price">{formatPrice(item.price)}</span>
            </div>
          ))}
          
          <div className="menu-flavors">
            <h3 className="menu-flavors-title">Flavors</h3>
            <p className="menu-flavor-list">
              {menuData.menu.Wings.flavors.join(", ")}
            </p>
            <p className="menu-notes">{menuData.menu.Wings.notes}</p>
          </div>
        </div>

        {/* Sides */}
        <div className="menu-category">
          <h2 className="menu-category-title">Sides</h2>
          {menuData.menu.Sides.items.map((item, index) => (
            <div key={index} className="menu-item">
              <span className="menu-item-name">{item.name}</span>
              <span className="menu-item-price">{formatPrice(item.price)}</span>
            </div>
          ))}
        </div>

        {/* Salads */}
        <div className="menu-category">
          <h2 className="menu-category-title">Salads</h2>
          <p className="menu-notes" style={{ marginBottom: '16px', marginTop: 0 }}>{menuData.menu.Salads.base_ingredients}</p>
          {menuData.menu.Salads.items.map((item, index) => (
            <div key={index} className="menu-item">
              <span className="menu-item-name">{item.name}</span>
              <span className="menu-item-price">{formatPrice(item.price)}</span>
            </div>
          ))}
          
          <div className="menu-addons">
            {menuData.menu.Salads.add_ons.map((addon, index) => (
              <div key={index} className="menu-addon-item">
                <span>{addon.name}</span>
                <span>+{formatPrice(addon.price)}</span>
              </div>
            ))}
          </div>

          <div className="menu-dressings">
            <h3 className="menu-dressings-title">Dressings</h3>
            <p className="menu-dressing-list">
              {menuData.menu.Salads.dressings.join(", ")}
            </p>
          </div>
        </div>

        {/* Special Menus */}
        <div className="menu-category">
          <h2 className="menu-category-title">Special Menus</h2>
          
          <div className="special-menu-item">
            <h3 className="special-menu-title">Taco Tuesday</h3>
            <p className="special-menu-description">{menuData.menu["Special Menus"]["Taco Tuesday"].description}</p>
          </div>

          <div className="special-menu-item">
            <h3 className="special-menu-title">Friday & Saturday</h3>
            <p className="special-menu-time">{menuData.menu["Special Menus"]["Friday & Saturday"].time}</p>
            <p className="special-menu-description">{menuData.menu["Special Menus"]["Friday & Saturday"].description}</p>
            
            {menuData.menu["Special Menus"]["Friday & Saturday"].items.map((item, index) => (
              <div key={index} className="menu-item">
                <span className="menu-item-name">{item.name}</span>
                <span className="menu-item-price">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
