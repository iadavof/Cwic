# XXX TODO oud kan weg?
general_holidays = [
  { key: 'new_year', date: '2008-01-01' },
  { key: 'good_friday', date: '2008-03-21' },
  { key: 'easter_sunday', date: '2008-03-23' },
  { key: 'easter_monday', date: '2008-03-24' },
  { key: 'ascension_day', date: '2008-05-01' },
  { key: 'whit_sunday', date: '2008-05-11' },
  { key: 'whit_monday', date: '2008-05-12' },
  { key: 'christmas_day', date: '2008-12-25' },
  { key: 'boxing_day', date: '2008-12-26' },
]
Holiday.create!(general_holidays.map { |h| h.tap { |h| h[:locale] = :general } })

nl_holidays = [
  { key: 'kings_day', date: '2008-04-27' },
  { key: 'liberation_day', date: '2008-05-05' },
]
Holiday.create!(nl_holidays.map { |h| h.tap { |h| h[:locale] = :nl } })
