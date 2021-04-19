"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Sublink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Sublink.belongsTo(models.Main, {
        foreignKey: "mainId",
        as: "main",
      });
      // define association here
    }
  }
  Sublink.init(
    {
      subtitle: DataTypes.STRING,
      suburl: DataTypes.STRING,
      subimage: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Sublink",
    }
  );
  return Sublink;
};
