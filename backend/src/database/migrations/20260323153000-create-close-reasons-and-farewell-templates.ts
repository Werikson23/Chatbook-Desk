import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        "CloseReasons",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          name: {
            type: DataTypes.STRING,
            allowNull: false
          },
          color: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "#607D8B"
          },
          isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
          },
          companyId: {
            type: DataTypes.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
          }
        },
        { transaction }
      );

      await queryInterface.createTable(
        "CloseReasonQueues",
        {
          closeReasonId: {
            type: DataTypes.INTEGER,
            references: { model: "CloseReasons", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          queueId: {
            type: DataTypes.INTEGER,
            references: { model: "Queues", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
          }
        },
        { transaction }
      );

      await queryInterface.addConstraint("CloseReasonQueues", {
        fields: ["closeReasonId", "queueId"],
        type: "unique",
        name: "unique_closereason_queue",
        transaction
      });

      await queryInterface.createTable(
        "FarewellTemplates",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          name: {
            type: DataTypes.STRING,
            allowNull: false
          },
          content: {
            type: DataTypes.TEXT,
            allowNull: false
          },
          isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
          },
          sortOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
          },
          companyId: {
            type: DataTypes.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
          }
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "Tickets",
        "closeReasonId",
        {
          type: DataTypes.INTEGER,
          references: { model: "CloseReasons", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          allowNull: true
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "Tickets",
        "farewellTemplateId",
        {
          type: DataTypes.INTEGER,
          references: { model: "FarewellTemplates", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          allowNull: true
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "Tickets",
        "closedByUserId",
        {
          type: DataTypes.INTEGER,
          references: { model: "Users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          allowNull: true
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "Tickets",
        "closedAt",
        {
          type: DataTypes.DATE,
          allowNull: true
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn("Tickets", "closedAt", { transaction });
      await queryInterface.removeColumn("Tickets", "closedByUserId", {
        transaction
      });
      await queryInterface.removeColumn("Tickets", "farewellTemplateId", {
        transaction
      });
      await queryInterface.removeColumn("Tickets", "closeReasonId", {
        transaction
      });
      await queryInterface.dropTable("FarewellTemplates", { transaction });
      await queryInterface.dropTable("CloseReasonQueues", { transaction });
      await queryInterface.dropTable("CloseReasons", { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
