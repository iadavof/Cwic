class NewReservationsWidget < Apotomo::Widget
  responds_to_event :organisation

  def display(args)
    @reservations = args[:organisation].reservations.order(created_at: :desc).first(6)
    render
  end
end
