# OTail - OpenTelemetry Tail Sampling Configuration UI

OTail is a user-friendly web interface for creating and managing OpenTelemetry tail sampling processor configurations. It provides a visual way to configure complex sampling policies without having to write YAML directly.

## UI
<img width="1467" alt="Screenshot 2024-12-01 at 13 57 34" src="https://github.com/user-attachments/assets/c21b8795-190e-4bd3-a3df-7a6940236d35">


## Features

- **Visual Policy Configuration**: Easily create and manage sampling policies through an intuitive UI
- **Real-time YAML Preview**: See the generated YAML configuration update in real-time
- **View Agent Effective Config**: View the effective configuration of the agent, including the generated YAML configuration
- **Send Updated Config To Agent**: Send the updated YAML configuration to the agent
- **Dark Mode Toggle**: Switch between light and dark themes
- **Configuration Validation**: Validate sampling policy configurations before applying
- **Export Configuration**: Export current configuration as a downloadable YAML file

## Local Setup

1. Clone the repository: `git clone https://github.com/your-username/otail.git`
2. Start docker compose: `docker compose up`
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

- Built with React and TypeScript
- Uses Monaco Editor for YAML editing
- Inspired by OpenTelemetry Collector configuration needs

## Roadmap

- [ ] Dark mode support
- [ ] Configuration persistence
- [ ] Policy grouping and organization
- [ ] Test sampling policy with real OTEL data