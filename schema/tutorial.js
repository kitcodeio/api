'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tutorial = sequelize.define('Tutorial', {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /((([A-Za-z]{4,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
          msg: 'that doesn\'t look like a valid link',
        },
      },
    },
    tags: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: DataTypes.STRING,
  }, {});
  Tutorial.associate = function(models) {
    Tutorial.belongsTo(models.User, {
      foreignKey: 'submitted_by',
    });
    Tutorial.belongsTo(models.Image, {
      foreignKey: 'image_id',
    });
    Tutorial.hasMany(models.TutorialTags, {
      foreignKey: 'tutorial_id',
    });
    Tutorial.hasMany(models.Container, {
      foreignKey: 'tutorial_id',
    });
  };
  return Tutorial;
};
