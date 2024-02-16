require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const keepAlive = require("./server.js");

const token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const rolesToCheck = [
  "Head mod",
  "Admin",
  "Head Directive Administrator/Head Developer",
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

    guild.commands.create({
      name: "timeout",
      description: "Put a user in timeout",
      options: [
        {
          name: "user",
          description: "The user to put in timeout",
          type: 6,
          required: true,
        },
        {
          name: "time",
          description: "The duration of timeout in minutes",
          type: 4, // Integer type
          required: true,
        },
      ],
    });
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options, member, guild } = interaction;

  if (commandName === "jail" || commandName === "timeout") {
    const user = options.getUser("user");
    const time = options.getInteger("time");

    const targetUser = guild.members.cache.get(user.id);

    // Check if the user has any of the restricted roles or the role named "bot"
    const hasRestrictedRole = member.roles.cache.some((role) =>
      rolesToCheck.includes(role.name)
    ) || member.roles.cache.some((role) => role.name.toLowerCase() === "bot");

    if (hasRestrictedRole) {
      interaction.reply(
        "You cannot perform this action on a user who has one of the restricted roles or the 'bot' role."
      );
      return;
    }

    const hasRequiredRole = member.roles.cache.some((role) =>
      rolesToCheck.includes(role.name)
    );

    if (!hasRequiredRole) {
      interaction.reply(
        "You do not have the required roles to use this command."
      );
      return;
    }

    if (!user || !time) {
      interaction.reply("Please provide both a user and a time.");
      return;
    }

    if (commandName === "jail") {
      handleJail(interaction, targetUser);
    } else if (commandName === "timeout") {
      handleTimeout(interaction, targetUser, time);
    }
  }
});

async function handleJail(interaction, user) {
  let prisonerRole = interaction.guild.roles.cache.find(
    (role) => role.name === "Prisoner"
  );
  if (!prisonerRole) {
    prisonerRole = await interaction.guild.roles.create({
      name: "Prisoner",
      reason: "Role required for jail command",
    });
  }

  const otherRoles = user.roles.cache.filter(
    (role) => role.id !== prisonerRole.id
  );
  await user.roles.remove(otherRoles);

  user.roles
    .add(prisonerRole)
    .then(() => {
      interaction.reply(`Successfully jailed ${user.user.tag}.`);
    })
    .catch((error) => {
      console.error("Error adding role:", error);
      interaction.reply("Failed to jail the user.");
    });
}

async function handleTimeout(interaction, user, time) {
  let timeoutRole = interaction.guild.roles.cache.find(
    (role) => role.name === "Timeout"
  );
  if (!timeoutRole) {
    timeoutRole = await interaction.guild.roles.create({
      name: "Timeout",
      reason: "Role required for timeout command",
    });
  }

  const otherRoles = user.roles.cache.filter(
    (role) => role.id !== timeoutRole.id
  );
  await user.roles.remove(otherRoles);

  user.roles
    .add(timeoutRole)
    .then(() => {
      interaction.reply(
        `Successfully put ${user.user.tag} in timeout for ${time} minutes.`
      );
      setTimeout(() => {
        user.roles.remove(timeoutRole);
      }, time * 60000); // Convert minutes to milliseconds
    })
    .catch((error) => {
      console.error("Error adding role:", error);
      interaction.reply("Failed to put the user in timeout.");
    });
}

keepAlive();
client.login(token);
