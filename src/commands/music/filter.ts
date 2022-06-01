import Command from "../../interfaces/Command";

export const command: Command = {
  name: "filter",
  description: "Add filters to the music player.",
  dmOnly: false,
  guildOnly: true,
  category: 'music',
  ephemeralReply: true,
  votedOnly: true,
  cooldown: 3,
  usage: ['list', 'manage <add|remove> <filter>', 'clear'],
  options: [
    {
      name: 'manage',
      description: 'Manage the filters for the queue.',
      type: 1,
      options: [
        {
          name: 'action',
          type: 3,
          description: 'The action to perform on the filter.',
          choices: [
            { value: 'add', name: 'add' },
            { value: 'remove', name: 'remove' },
          ],
          required: true,
        },
        {
          name: 'filter',
          description: 'The filter to add.',
          required: true,
          type: 3,
          choices: [
            { value: 'bassboost', name: 'Bassboost filter' },
            { value: 'vaporwave', name: 'Vaporwave filter' },
            { value: 'nightcore', name: 'Nightcore filter' },
            { value: 'phaser', name: 'Phaser filter' },
            { value: 'tremolo', name: 'Tremolo filter' },
            { value: 'vibrato', name: 'Vibrato filter' },
            { value: 'reverse', name: 'Reverse filter' },
            { value: 'treble', name: 'Treble filter' },
            { value: 'normalizer', name: 'Normaliser filter' },
            { value: 'surrounding', name: 'Surrounding filter' },
            { value: 'pulsator', name: 'Pulsator filter' },
            { value: 'subboost', name: 'Subboost filter' },
            { value: 'karaoke', name: 'Karaoke filter' },
            { value: 'flanger', name: 'Flanger filter' },
            { value: 'gate', name: 'Gate filter' },
            { value: 'haas', name: 'Haas filter' },
            { value: 'mcompand', name: 'Mcompand filter' },
            { value: 'mono', name: 'Mono filter' },
            { value: 'compressor', name: 'Compressor filter' },
            { value: 'expander', name: 'Expander filter' },
            { value: 'softlimiter', name: 'Softlimiter filter' },
            { value: 'chorus', name: 'Chorus filter' },
            { value: 'fadein', name: 'Fade in filter' },
            { value: 'dim', name: 'Dim filter' },
            { value: 'earrape', name: 'Earrape filter' },
          ]
        }
      ]
    },
    {
      name: 'list',
      description: 'List all the filters enabled.',
      type: 1,
    },
    {
      name: 'clear',
      description: 'Clear all the filters.',
      type: 1,
    }
  ],

  run: async (client, interaction) => {
    const queue = client.musicPlayer.getQueue(interaction.guildId!);

    if (!queue || !queue.playing) return await interaction.editReply({
      embeds: [
        {
          author: { name: "No music playing", iconURL: client.customEmojisUrl.error },
          description: "There is no music playing right now.",
          color: client.colors.error.decimal,
        }
      ]
    });

    const subCommand = interaction.options.getSubcommand() as 'list' | 'manage' | 'clear';
    const filter = interaction.options.getString('filter') as 'bassboost_low' | 'bassboost' | 'bassboost_high' | '8D' | 'vaporwave' | 'nightcore' | 'phaser' | 'tremolo' | 'vibrato' | 'reverse' | 'treble' | 'normalizer' | 'normalizer2' | 'surrounding' | 'pulsator' | 'subboost' | 'karaoke' | 'flanger' | 'gate' | 'haas' | 'mcompand' | 'mono' | 'mstlr' | 'mstrr' | 'compressor' | 'expander' | 'softlimiter' | 'chorus' | 'chorus2d' | 'chorus3d' | 'fadein' | 'dim' | 'earrape' | undefined;
    const action = interaction.options.getString('action') as 'add' | 'remove' | undefined;

    switch (subCommand) {
      case 'list': {
        const filters = queue.getFiltersEnabled();

        if (!filters.length) return await interaction.editReply({
          embeds: [
            {
              author: { name: "No filters enabled", iconURL: client.customEmojisUrl.music },
              description: "There are no filters enabled for this queue.",
              color: client.colors.embedColor.decimal,
            },
          ],
        });

        return await interaction.editReply({
          embeds: [
            {
              author: { name: "Filters enabled", iconURL: client.customEmojisUrl.music },
              description: "These are the enabled filters for this queue:\n\n> " + filters.map(f => `\`${f}\``).join(', '),
              color: client.colors.embedColor.decimal,
            },
          ],
        });
      }
      case 'clear': {
        await interaction.editReply({
          embeds: [
            {
              description: `${client.customEmojis.loading} Clearing filters...`,
              color: client.colors.embedColor.decimal,
            }
          ],
        });

        await queue.setFilters();

        return await interaction.editReply({
          embeds: [
            {
              author: { name: 'Cleared filters', iconURL: client.customEmojisUrl.success },
              description: `Successfully cleared the filters for this queue.`,
              color: client.colors.success.decimal,
            }
          ],
        });
      }
      case 'manage': {
        const currentFilters = queue.getFiltersEnabled();
        const filterExists = currentFilters.includes(filter!);
        const updatedFilters: any = {};

        if (action === 'add') {
          if (filterExists) return await interaction.editReply({
            embeds: [
              {
                author: { name: "Filter already enabled", iconURL: client.customEmojisUrl.error },
                description: `The filter \`${filter}\` is already enabled for this queue.`,
                color: client.colors.error.decimal,
              }
            ]
          });

          await interaction.editReply({
            embeds: [
              {
                description: `${client.customEmojis.loading} Enabling filter...`,
                color: client.colors.embedColor.decimal,
              }
            ],
          });

          currentFilters.forEach(f => updatedFilters[f] = true);
          updatedFilters[filter!] = true;

          await queue.setFilters(updatedFilters);

          return await interaction.editReply({
            embeds: [
              {
                author: { name: 'Enabled filter', iconURL: client.customEmojisUrl.success },
                description: `Successfully enabled the filter \`${filter}\` for this queue.`,
                fields: [
                  {
                    name: 'Current filters',
                    value: currentFilters.map(f => `\`${f}\``).join(', '),
                  }
                ],
                color: client.colors.success.decimal,
              },
            ],
          });
        } else if (action === 'remove') {
          if (!filterExists) return await interaction.editReply({
            embeds: [
              {
                author: { name: "Filter not enabled", iconURL: client.customEmojisUrl.error },
                description: `The filter \`${filter}\` is not enabled for this queue.`,
                color: client.colors.error.decimal,
              }
            ]
          });

          await interaction.editReply({
            embeds: [
              {
                description: `${client.customEmojis.loading} Disabling filter...`,
                color: client.colors.embedColor.decimal,
              }
            ],
          });

          currentFilters.forEach(f => updatedFilters[f] = true);
          updatedFilters[filter!] = false;

          await queue.setFilters(updatedFilters);

          return await interaction.editReply({
            embeds: [
              {
                author: { name: 'Disabled filter', iconURL: client.customEmojisUrl.success },
                description: `Successfully disabled the filter \`${filter}\` for this queue.`,
                fields: [
                  {
                    name: 'Current filters',
                    value: currentFilters.map(f => `\`${f}\``).join(', '),
                  }
                ],
                color: client.colors.success.decimal,
              },
            ],
          });
        }
      };
    }
  }
}