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
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() || interaction.commandName !== "jail") return;

  const user = interaction.options.getUser("user");

  const hasRequiredRole = interaction.member.roles.cache.some((role) =>
    rolesToCheck.includes(role.name),
  );

  if (hasRequiredRole) {
    if (user) {
      const targetUser = interaction.guild.members.cache.get(user.id);

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

keepAlive();
client.login(token);
