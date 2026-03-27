import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        "AttributeContainers",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          companyId: {
            type: DataTypes.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          name: { type: DataTypes.STRING, allowNull: false },
          key: { type: DataTypes.STRING, allowNull: false },
          entityType: { type: DataTypes.STRING, allowNull: false },
          category: { type: DataTypes.STRING, allowNull: true },
          icon: { type: DataTypes.STRING, allowNull: true },
          color: { type: DataTypes.STRING, allowNull: true },
          uiLayout: { type: DataTypes.STRING, allowNull: true, defaultValue: "tabs" },
          isRepeatable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
          isCollapsible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
          sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false }
        },
        { transaction }
      );

      await queryInterface.addConstraint("AttributeContainers", {
        fields: ["companyId", "key", "entityType"],
        type: "unique",
        name: "AttributeContainers_company_key_entity_unique",
        transaction
      });

      await queryInterface.addIndex("AttributeContainers", ["companyId", "entityType"], {
        name: "AttributeContainers_company_entity_idx",
        transaction
      });

      await queryInterface.createTable(
        "AttributeDefinitions",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          companyId: {
            type: DataTypes.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          containerId: {
            type: DataTypes.INTEGER,
            references: { model: "AttributeContainers", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          name: { type: DataTypes.STRING, allowNull: false },
          key: { type: DataTypes.STRING, allowNull: false },
          dataType: { type: DataTypes.STRING, allowNull: false },
          version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
          isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
          isRequired: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
          isSearchable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
          isRepeatable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
          validationRules: { type: DataTypes.JSONB, allowNull: true },
          options: { type: DataTypes.JSONB, allowNull: true },
          defaultValue: { type: DataTypes.JSONB, allowNull: true },
          visibility: { type: DataTypes.STRING, allowNull: true, defaultValue: "all" },
          sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false }
        },
        { transaction }
      );

      await queryInterface.addConstraint("AttributeDefinitions", {
        fields: ["containerId", "key"],
        type: "unique",
        name: "AttributeDefinitions_container_key_unique",
        transaction
      });

      await queryInterface.addIndex("AttributeDefinitions", ["companyId", "containerId"], {
        name: "AttributeDefinitions_company_container_idx",
        transaction
      });

      await queryInterface.createTable(
        "AttributeGroupInstances",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          companyId: {
            type: DataTypes.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          containerId: {
            type: DataTypes.INTEGER,
            references: { model: "AttributeContainers", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          entityType: { type: DataTypes.STRING, allowNull: false },
          entityId: { type: DataTypes.INTEGER, allowNull: false },
          label: { type: DataTypes.STRING, allowNull: false },
          sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false }
        },
        { transaction }
      );

      await queryInterface.addIndex("AttributeGroupInstances", ["companyId", "entityType", "entityId"], {
        name: "AttributeGroupInstances_company_entity_idx",
        transaction
      });

      await queryInterface.addIndex("AttributeGroupInstances", ["containerId"], {
        name: "AttributeGroupInstances_container_idx",
        transaction
      });

      await queryInterface.createTable(
        "AttributeValues",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          companyId: {
            type: DataTypes.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          attributeDefinitionId: {
            type: DataTypes.INTEGER,
            references: { model: "AttributeDefinitions", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          entityType: { type: DataTypes.STRING, allowNull: false },
          entityId: { type: DataTypes.INTEGER, allowNull: false },
          groupInstanceId: {
            type: DataTypes.INTEGER,
            references: { model: "AttributeGroupInstances", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: true
          },
          valueText: { type: DataTypes.TEXT, allowNull: true },
          valueNumber: { type: DataTypes.DECIMAL(20, 6), allowNull: true },
          valueBoolean: { type: DataTypes.BOOLEAN, allowNull: true },
          valueDate: { type: DataTypes.DATE, allowNull: true },
          valueJson: { type: DataTypes.JSONB, allowNull: true },
          valueStringIndex: { type: DataTypes.STRING(512), allowNull: true },
          valueNumberIndex: { type: DataTypes.DECIMAL(20, 6), allowNull: true },
          valueDateIndex: { type: DataTypes.DATE, allowNull: true },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false }
        },
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
        CREATE UNIQUE INDEX "AttributeValues_unique_attr_entity_no_group"
        ON "AttributeValues" ("attributeDefinitionId", "entityType", "entityId")
        WHERE "groupInstanceId" IS NULL;
        `,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `
        CREATE UNIQUE INDEX "AttributeValues_unique_attr_entity_with_group"
        ON "AttributeValues" ("attributeDefinitionId", "entityType", "entityId", "groupInstanceId")
        WHERE "groupInstanceId" IS NOT NULL;
        `,
        { transaction }
      );

      await queryInterface.addIndex("AttributeValues", ["companyId", "entityType", "entityId"], {
        name: "AttributeValues_company_entity_idx",
        transaction
      });

      await queryInterface.createTable(
        "AttributeAuditLogs",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          companyId: {
            type: DataTypes.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          actorId: { type: DataTypes.INTEGER, allowNull: true },
          actorType: { type: DataTypes.STRING, allowNull: false, defaultValue: "user" },
          action: { type: DataTypes.STRING, allowNull: false },
          entityType: { type: DataTypes.STRING, allowNull: false },
          entityId: { type: DataTypes.INTEGER, allowNull: false },
          fieldName: { type: DataTypes.STRING, allowNull: true },
          oldValue: { type: DataTypes.JSONB, allowNull: true },
          newValue: { type: DataTypes.JSONB, allowNull: true },
          metadata: { type: DataTypes.JSONB, allowNull: true },
          ipAddress: { type: DataTypes.STRING, allowNull: true },
          userAgent: { type: DataTypes.TEXT, allowNull: true },
          source: { type: DataTypes.STRING, allowNull: true },
          createdAt: { type: DataTypes.DATE, allowNull: false }
        },
        { transaction }
      );

      await queryInterface.addIndex("AttributeAuditLogs", ["companyId", "createdAt"], {
        name: "AttributeAuditLogs_company_created_idx",
        transaction
      });

      await queryInterface.addIndex("AttributeAuditLogs", ["companyId", "entityType", "entityId"], {
        name: "AttributeAuditLogs_company_entity_idx",
        transaction
      });

      await queryInterface.createTable(
        "AttributeContainerProfilePermissions",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          companyId: {
            type: DataTypes.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          containerId: {
            type: DataTypes.INTEGER,
            references: { model: "AttributeContainers", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          profile: { type: DataTypes.STRING, allowNull: false },
          canView: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
          canEdit: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
          canCopy: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false }
        },
        { transaction }
      );

      await queryInterface.addConstraint("AttributeContainerProfilePermissions", {
        fields: ["companyId", "containerId", "profile"],
        type: "unique",
        name: "AttributeContainerProfilePermissions_unique",
        transaction
      });

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable("AttributeContainerProfilePermissions", { transaction });
      await queryInterface.dropTable("AttributeAuditLogs", { transaction });
      await queryInterface.dropTable("AttributeValues", { transaction });
      await queryInterface.dropTable("AttributeGroupInstances", { transaction });
      await queryInterface.dropTable("AttributeDefinitions", { transaction });
      await queryInterface.dropTable("AttributeContainers", { transaction });
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }
};
