"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Main extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Main.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      Main.hasMany(models.Sublink, {
        as: "sublink",
      });
      // define association here
    }
  }
  Main.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      uniquelink: DataTypes.STRING,
      image: DataTypes.STRING,
      template: DataTypes.INTEGER,
      views: DataTypes.INTEGER,
      likes: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Main",
    }
  );
  return Main;
};
