# Adds export functionalities to a model (export to CSV or Excel)
module Exportable
  extend ActiveSupport::Concern

  module ClassMethods
    def export_headers
      export_data.map do |key, options|
        if options.is_a?(Hash) && options[:label].present?
          options[:label]
        else
          human_attribute_name(key)
        end
      end
    end

    def export(format = nil)
      case format
      when nil
        export_array
      else
        self.send("export_as_#{format}")
      end
    end

    def export_filename(format = nil)
      filename = "#{self.model_name.human(count: 2).lcfirst}_#{I18n.l(Time.now, format: :default).gsub(' ', '_')}"
      case format
      when nil
        filename
      else
        "#{filename}.#{format}"
      end
    end

    def export_array
      [export_headers] + self.all.map { |obj| obj.export_array }
    end

    def export_as_csv
      CSV.generate do |csv|
        export_array.each do |line|
          csv << line
        end
      end
    end

    def export_as_xls
      render(template: 'exports/excel.xls.erb', format: :xls, locals: { model: self })
    end
    alias_method :export_as_excel, :export_as_xls

    def render(*args)
      ActionView::Base.new(Rails.configuration.paths["app/views"]).render(*args)
    end
  end

  delegate :render, to: :class

  def export_array
    self.class.export_data.map do |key, options|
      export_attribute(key, :array, options)
    end
  end

  def export_as_xls
    render(partial: 'exports/row.xls.erb', format: :xls, locals: { object: self })
  end

  def export_attribute_raw(key, options)
    self.send(key)
  end

  def export_attribute(key, format, options)
    raw = export_attribute_raw(key, options)
    options = {} unless options.is_a?(Hash)
    if options[:formatter].present?
      options[:formatter].call(raw, options)
    else
      export_format_attribute_by_type(raw, format, options)
    end
  end

  def export_format_attribute_by_type(raw, format, options)
    case raw
    when ActiveRecord::Base
      (raw.respond_to?(:instance_name) ? raw.instance_name : raw)
    when ActiveSupport::TimeWithZone
      (format == :xls ? raw.to_s(:db) : I18n.l(raw, format: :long))
    else
      raw
    end
  end

  def export_attribute_excel_type(key, options)
    raw = export_attribute_raw(key, options)
    case raw
    when Numeric
      'Number'
    when ActiveSupport::TimeWithZone
      'Time'
    else
      'String'
    end
  end
end
