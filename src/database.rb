require 'sqlite3'
require 'securerandom'
require 'taglib'

class Database
  def initialize
    @db = SQLite3::Database.new '/home/m/autorave/database.db'
    create_table
  end

  def create_table
    @db.execute <<-SQL
      CREATE TABLE IF NOT EXISTS tracks (
        uuid TEXT PRIMARY KEY NOT NULL,
        filename TEXT NOT NULL,
        album TEXT NOT NULL,
        length REAL NOT NULL,
        deleted BOOLEAN DEFAULT FALSE,
        upvotes INTEGER DEFAULT 0,
        times_listened INTEGER DEFAULT 0
      );
    SQL
  end

  def scan_tracks
    existing_tracks = @db.execute('SELECT uuid, filename, album FROM tracks').to_h { |row| [row[1..2], row[0]] }

    Dir['/home/m/autorave/music/*/*.mp3', '/home/m/autorave/music/*/*.wav'].each do |file_path|
      album, filename = file_path.split('/')[-2..]
      key = [filename, album]

      if not existing_tracks[key]
        add_track(album, filename, file_path)
      end
    end
  end

  def add_track(album, filename, file_path)
    uuid = SecureRandom.uuid
    length = TagLib::FileRef.open(file_path) do |file|
      file.audio_properties.length_in_milliseconds / 1000.0
    end
    @db.execute('INSERT INTO tracks (uuid, filename, album, length) VALUES (?, ?, ?, ?)', [uuid, filename, album, length])
  end

  def get_track(uuid)
    result = @db.execute('SELECT * FROM tracks WHERE uuid = ?', [uuid])
    result.empty? ? nil : Hash[@db.execute2('SELECT * FROM tracks')[0].zip(result.first)]
  end

  def update_track_dangerous(uuid, attributes)
    update_str = attributes.map { |k, v| "#{k} = #{v}" }.join(', ')
    values = [uuid]
    @db.execute("UPDATE tracks SET #{update_str} WHERE uuid = ?", values)
  end

  def delete_track(uuid)
    @db.execute('UPDATE tracks SET deleted = ? WHERE uuid = ?', [true, uuid])
  end

  def get_all_tracks
    @db.execute2('SELECT * FROM tracks').drop(1).map do |row|
      Hash[@db.execute2('SELECT * FROM tracks')[0].zip(row)]
    end
  end
end
