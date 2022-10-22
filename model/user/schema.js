import mongoose from "mongoose";

export const schema = {
  username: {
    type: String,
    required: true,
    min: 2,
    max: 255,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  hasAdsEnabled: {
    type: Boolean,
    default: false,
    required: false,
  },
  role: {
    type: String, // "user" | "admin"
    default: "user"
  },
  password: {
    type: String,
    required: true,
    max: 255,
    min: 6
  },
  experience: {
    type: Number,
    default: 0,
  },
  experienceRequiredForNextLevel: {
    type: Number,
    default: 1000,
  },
  level: {
    type: Number,
    default: 0,
  },
  cards: [ // Used for foreign key purpose
    {type: mongoose.Schema.Types.ObjectId, ref: 'Card'}
  ],
  lastActivity: {type: Date},

  // Has categories displayed
  hasCategoriesDisplayed: {type: Boolean, default: true},
  hasStreakNotifications: {type: Boolean, default: true},
  hasSoundEnabled: {type: Boolean, default: true},
  limitDate: {type: Date},
  intervals: [
    {
      value: Number,
      isEnabled: {
        type: Boolean,
        default: true,
      }
    }
  ]
}