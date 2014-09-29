module Taggable
  extend ActiveSupport::Concern

  included do
    acts_as_taggable
    before_save :set_tag_owner

    def tag_list
      if @tag_list
        @tag_list
      else
        tags_from(self.organisation)
      end
    end
  end

  private

  def set_tag_owner
    # Set the owner of some tags based on the current tag_list
    set_owner_tag_list_on(self.organisation, :tags, self.tag_list)
    # Clear the list so we don't get duplicate taggings
    self.tag_list = nil
 end
end
