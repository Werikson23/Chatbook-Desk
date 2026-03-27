import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        "Backups",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "full"
          },
          status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "pending"
          },
          filePath: {
            type: DataTypes.STRING,
            allowNull: true
          },
          checksum: {
            type: DataTypes.STRING,
            allowNull: true
          },
          sizeBytes: {
            type: DataTypes.BIGINT,
            allowNull: true
          },
          errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          metadata: {
            type: DataTypes.JSONB,
            allowNull: true
          },
          startedAt: {
            type: DataTypes.DATE,
            allowNull: true
          },
          finishedAt: {
            type: DataTypes.DATE,
            allowNull: true
          },
          companyId: {
            type: DataTypes.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          triggeredByUserId: {
            type: DataTypes.INTEGER,
            references: { model: "Users", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            allowNull: true
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
        "BackupRestoreLogs",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          backupId: {
            type: DataTypes.INTEGER,
            references: { model: "Backups", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          companyId: {
            type: DataTypes.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          executedByUserId: {
            type: DataTypes.INTEGER,
            references: { model: "Users", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            allowNull: true
          },
          status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "running"
          },
          notes: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true
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

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable("BackupRestoreLogs", { transaction });
      await queryInterface.dropTable("Backups", { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
