var jsLang = {
  shortcutKeys: {
    overview: 'v', // o gives focus errors in firefox
    reservations: 'r',
    settings: 's',
    admin: 'a',
  },
  global: {
    none: 'Geen',
    prompt: 'Selecteer',
    yes: 'Ja',
    no: 'Nee',
    and_connector: ' en ',
    expand_menu: 'Menu uitklappen',
    contract_menu: 'Menu inklappen',
  },
  stickies: {
    placeholder: 'Voer hier uw notitie in...',
    saved: 'Opgeslagen',
  },
  schedule_view: {
    no_objects: 'Geen objecten geselecteerd.',
    being_saved: 'Bezig met opslaan...',
    saving_error: 'Fout tijdens opslaan.',
    saved: 'Wijzigingen opgeslagen.',
    undo: 'Ongedaan maken',
    deleting: 'Reservering wordt verwijderd...',
    deleted: 'Reservering verwijderd.',
    delete_confirm: 'Weet u zeker dat u Reservering #%{item_id} wilt verwijderen? De reservering kan hierna niet worden hersteld.',
  },
  reservation_rule_scopes: {
    span_selectors: {
      year: {
        'dates': 'Datums',
        'weeks': 'Weken',
        'holidays': 'Feestdagen'
      },
      month: {
        'days': 'Dagen',
        'nr_dow_of': 'De <x>de dag van de maand'
      }
    }
  }
}