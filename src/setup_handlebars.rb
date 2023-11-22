require "ruby-handlebars"

def setupHandlebars
  hbs = Handlebars::Handlebars.new

  templates_directory = File.join(File.dirname(__FILE__), '../templates/')
  compiled_templates = {}

  Dir.entries(templates_directory).each do |file|
    next unless file.end_with?('.hbs')

    file_path = File.join(templates_directory, file)
    template_name = File.basename(file, '.hbs')
    template_string = File.read(file_path)

    hbs.register_partial(template_name, template_string)

    compiled_templates[template_name] = hbs.compile(template_string)
  end

  return compiled_templates
end

