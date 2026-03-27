import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Users", "signatureTemplate", {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn("Users", "signatureChannels", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "whatsapp,email,facebook,instagram"
    });

    await queryInterface.addColumn("Users", "signatureAutoMode", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "always"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Users", "signatureAutoMode");
    await queryInterface.removeColumn("Users", "signatureChannels");
    await queryInterface.removeColumn("Users", "signatureTemplate");
  }
};
