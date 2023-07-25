# Houston

Houston is a React based dashboard for monitoring Arduino boards during operation. I built it to monitor my university's
wind turbine, but it can be used for any Arduino board.

![Dashboard Screenshot](dashboard.png)

## ToDo (not necessarily in order)

* Cleaner UI
* ~~Live Graphs~~
* ~~Save Data to File~~
* Max,min,etc for variables
* Migrate to Typescript
* Configuring Variables Live
* Installation Guide

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

Please ensure you have the following installed

* NodeJS
* NPM
* Python3
* Pip

### Installation

1. Clone the repo
2. Move [Dashboard.h](Dashboard.h) into your Arduino project
3. Install NPM packages
   ```sh
   npm install
   ```
4. Install Python packages
   ```python
   pip install aiohttp python-socketio pyserial
   ```

<!-- USAGE EXAMPLES -->

## Usage

1. Send data from Arduino to the dashboard by including Dashboard.h and then
   ```c
   Dashboard::telemetry("Header", "Telemetry");
   ```
2. Then put the following at the end of everything
   ```c
   Dashboard::send();
   ```
3. Start the python server by doing
   ```python
   python Server.py
   ```
4. Start the dashboard by doing
   ```sh
   npm start
   ```
5. Change the port your Arduino is connected to and hit Attach

## Protocol Specifications

### Modify Packet

This is used to modify a value within the system

* [Format](https://docs.python.org/3/library/struct.html): <BH3s[f/I]I
    * B: packet id, used to specify type of action
    * H: Number of bytes contained in string data. For modify packet:3
    * [#]s: First byte will specify numeric data's type. F for float, I for integer,B for boolean. The next 2 byte will
      be the variable name to change
    * [f/I]: The actual numeric data specified by previous, boolean still uses I
    * I: checksum of 3s[f/I] data