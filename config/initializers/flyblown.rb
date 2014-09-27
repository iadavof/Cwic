if Rails.application.config.flyblown
  Cwic::Application.config.middleware.use(ExceptionNotification::Rack,
    email: {
      email_prefix: '[Exception] ',
      sender_address: %{"Flyblown" <flyblown@cwic.nl>},
      exception_recipients: %w{info@iada.nl}
    },
    notify_my_android: {
      api_keys: [
        '7522222f8f35745ffc1a1ef518020e8cfeb853869f1c7159', # Christiaan
        'ecda7552d2e19c00478fb44afab3c045122973fddfaaa78f', # Floris
        'bb59ba09f76b67363102bdea271186256aef55e8a0d7cb8a' # Kevin
      ],
      priority: NMA::Priority::HIGH,
      application: '[Flyblown] Cwic',
      event: 'Exception occured'
    }
  )
end
