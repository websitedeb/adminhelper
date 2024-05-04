require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const keepAlive = require("./server.js");

const token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const rolesToCheck = [
  "Head mod",
  "Admin",
  "Head Directive Administrator/Head Developer",
  "Group God Spicyy",
  "Second Man Xeodax",
  "Third Man Acolon",
  "Group leader",
  "Developer admin",
];

client.once("ready", () => {
  console.log("Bot is ready!");

  client.guilds.cache.forEach((guild) => {
    guild.commands.create({
      name: "jail",
      description: "Jail a user",
      options: [
        {
          name: "user",
          description: "The user to jail",
          type: 6,
          required: true,
        },
      ],
    });
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() || interaction.commandName !== "jail") return;

  let user = interaction.options.getUser("user");

  // Get the member object of the user
  let member = interaction.guild.members.cache.get(user.id);

  // Check if the user has any of the roles in rolesToCheck or has the role named "bot"
  let hasRestrictedRole =
    member.roles.cache.some((role) => rolesToCheck.includes(role.name)) ||
    member.roles.cache.some((role) => role.name.toLowerCase() === "bot");

  if (hasRestrictedRole) {
    interaction.reply(
      "You cannot jail a user who has one of the restricted roles or the 'bot' role.",
    );
    return;
  }

  let hasRequiredRole = interaction.member.roles.cache.some((role) =>
    rolesToCheck.includes(role.name),
  );

  if (hasRequiredRole) {
    if (user) {
      let targetUser = interaction.guild.members.cache.get(user.id);

      if (targetUser) {
        let prisonerRole = interaction.guild.roles.cache.find(
          (role) => role.name === "Prisoner",
        );
        if (!prisonerRole) {
          prisonerRole = await interaction.guild.roles.create({
            name: "Prisoner",
            reason: "Role required for jail command",
          });
        }

        // Remove all roles except for the 'Prisoner' role
        let otherRoles = targetUser.roles.cache.filter(
          (role) => role.id !== prisonerRole.id,
        );
        await targetUser.roles.remove(otherRoles);

        targetUser.roles
          .add(prisonerRole)
          .then(() => {
            interaction.reply(`Successfully jailed ${user.tag}.`);
          })
          .catch((error) => {
            console.error("Error adding role:", error);
            interaction.reply("Failed to jail the user.");
          });
      } else {
        interaction.reply("User not found.");
      }
    } else {
      interaction.reply("User not provided.");
    }
  } else {
    interaction.reply(
      "You do not have the required roles to use this command.",
    );
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() || interaction.commandName !== "gayify") return;

  let user = interaction.options.getUser("user");

  // Get the member object of the user
  let member = interaction.guild.members.cache.get(user.id);

  // Check if the user has any of the roles in rolesToCheck or has the role named "bot"
  let hasRestrictedRole =
    member.roles.cache.some((role) => rolesToCheck.includes(role.name)) ||
    member.roles.cache.some((role) => role.name.toLowerCase() === "bot");

  if (hasRestrictedRole) {
    interaction.reply(
      "You cannot gayify a user who has one of the restricted roles or the 'bot' role.",
    );
    return;
  }

  let hasRequiredRole = interaction.member.roles.cache.some((role) =>
    rolesToCheck.includes(role.name),
  );

  if (hasRequiredRole) {
    if (user) {
      let targetUser = interaction.guild.members.cache.get(user.id);

      if (targetUser) {
        let prisonerRole = interaction.guild.roles.cache.find(
          (role) => role.name === "🏳️‍🌈gay",
        );
        if (!prisonerRole) {
          prisonerRole = await interaction.guild.roles.create({
            name: "🏳️‍🌈gay",
            reason: "Role required for gayify command",
          });
        }

        // Remove all roles except for the 'Prisoner' role
        let otherRoles = targetUser.roles.cache.filter(
          (role) => role.id !== prisonerRole.id,
        );
        await targetUser.roles.remove(otherRoles);

        targetUser.roles
          .add(prisonerRole)
          .then(() => {
            interaction.reply(`Successfully gay'ed ${user.tag}.`);
          })
          .catch((error) => {
            console.error("Error adding role:", error);
            interaction.reply("Failed to gay the user.");
          });
      } else {
        interaction.reply("User not found.");
      }
    } else {
      interaction.reply("User not provided.");
    }
  } else {
    interaction.reply(
      "You do not have the required roles to use this command.",
    );
  }
});

keepAlive();
client.login(token);
