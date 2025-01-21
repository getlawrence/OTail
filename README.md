# OTail - OpenTelemetry Tail Sampling

OTail is a user-friendly web interface for creating and managing OpenTelemetry tail sampling agents. It provides a visual way to configure complex sampling policies without having to write YAML directly.

## UI
<img width="1664" alt="Screenshot 2025-01-21 at 16 46 13" src="https://github.com/user-attachments/assets/f6c2e316-a365-4503-afef-f8298e298d87" />



## Features

- **Visual Policy Configuration**: Easily create and manage sampling policies through an intuitive UI
- **Configuration Validation**: Validate sampling policy configurations before applying
- **View Agent Effective Config**: View the effective configuration of the agent
- **Send Updated Config To Agent**: Send the updated YAML configuration to the agent

## Local Setup

1. Clone the repository: `git clone https://github.com/your-username/otail.git`
2. Start docker compose: `docker compose up -d`
3. Open your browser and navigate to http://localhost:3000


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with React TypeScript and Go
- Uses Monaco Editor for YAML editing
- Inspired by OpenTelemetry Collector configuration needs
