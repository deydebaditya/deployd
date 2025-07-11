package config

import (
	"os"

	"gopkg.in/yaml.v2"
)

// Config holds the application configuration.

type Config struct {
	Github struct {
		ClientID     string `yaml:"client_id"`
		ClientSecret string `yaml:"client_secret"`
	} `yaml:"github"`
	Server struct {
		Port string `yaml:"port"`
	} `yaml:"server"`
	Frontend struct {
		URL string `yaml:"url"`
	} `yaml:"frontend"`
	Database struct {
		Host     string `yaml:"host"`
		Port     string `yaml:"port"`
		User     string `yaml:"user"`
		Password string `yaml:"password"`
		DBName   string `yaml:"dbname"`
	} `yaml:"database"`
}

// LoadConfig reads the configuration from the given file path.

func LoadConfig(path string) (*Config, error) {
	configFile, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var config Config
	if err := yaml.Unmarshal(configFile, &config); err != nil {
		return nil, err
	}

	return &config, nil
}
