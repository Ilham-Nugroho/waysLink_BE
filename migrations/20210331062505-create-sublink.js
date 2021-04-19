"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Sublinks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      subtitle: {
        type: Sequelize.STRING,
      },
      suburl: {
        type: Sequelize.STRING,
      },
      subimage: {
        type: Sequelize.STRING,
      },
      mainId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Mains",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Sublinks");
  },
};
