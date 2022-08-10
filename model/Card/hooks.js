import UserCard from "../userCard.js";

export function onRemove(next) {
  console.log("Removing card " + this._id);
  UserCard.remove({cardId: this._id}).exec().then(next);
}