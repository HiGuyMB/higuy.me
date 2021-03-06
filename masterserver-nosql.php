<?php
//-----------------------------------------------------------------------------
// MasterServer.php
//
// Copyright (c) 2014 HiGuy Smith
// Portions Copyright (c) GarageGames.com, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// References:
// serverQuery.cc
// c3masterserver.pl
// http://perldoc.perl.org/functions/pack.html
// http://www.binarytides.com/udp-socket-programming-in-php/
//-----------------------------------------------------------------------------

//Port to listen on
$port    = 29000;
//Maximum length of a data buffer
$maxlen  = 1024;
//Time before servers are removed from the list
$timeout = 120;
//Time before servers are sent a second info request
$refresh = 90;
//Should logs be printed to stdout?
$debug = 0;

//Create a TCP/IP socket
if (!($socket = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP))) {
	//Error creating the socket, abort.
	socketError();
}

debugEcho("Created socket\n");

//Bind the socket to accept all connections on $port
if (!socket_bind($socket, "0.0.0.0", $port)) {
	//Abort if error
	socketError();
}

debugEcho("Socket bound\n");

//Close the socket on shutdown
register_shutdown_function("onShutdown");

//Initialize an empty array of servers
$serverlist = array();

//Loop forever, this is a server process
while (true) {

	debugEcho("Waiting for a connection\n");

	$buffer = "";
	$address = "";
	$port = "";

	//Read from any UDP source that we can find
	$r = socket_recvfrom($socket, $buffer, $maxlen, 0, $address, $port);

	//The first byte of the data is the command from the client
	$cmd = ord($buffer[0]);

	if ($debug) {
		//Print the data from them
		echo("Got " . mb_strlen($buffer) . " bytes from $address:$port\n");
		for ($i = 0; $i < mb_strlen($buffer); $i ++) {
			printf("%02X ", ord($buffer[$i]));
		}
		printf("\n");
		echo("Command: $cmd\n");
	}

/*
	Via Torque3D:

	enum PacketTypes
	{
		MasterServerGameTypesRequest  = 2,
		MasterServerGameTypesResponse = 4,
		MasterServerListRequest       = 6,
		MasterServerListResponse      = 8,
		GameMasterInfoRequest         = 10,
		GameMasterInfoResponse        = 12,
		GamePingRequest               = 14,
		GamePingResponse              = 16,
		GameInfoRequest               = 18,
		GameInfoResponse              = 20,
		GameHeartbeat                 = 22,

		ConnectChallengeRequest       = 26,
		ConnectChallengeReject        = 28,
		ConnectChallengeResponse      = 30,
		ConnectRequest                = 32,
		ConnectReject                 = 34,
		ConnectAccept                 = 36,
		Disconnect                    = 38,
	};
*/
	switch ($cmd) {
	case 6: //MasterServerListRequest

		//Read all of their data from the buffer, each call mutates $buffer
		readChar ($buffer, $cmd_type);
		readChar ($buffer, $query_flags);
		readInt  ($buffer, $key);
		readChar ($buffer, $dummy);
		readStr  ($buffer, $game_type);
		readStr  ($buffer, $mission_type);
		readChar ($buffer, $min_players);
		readChar ($buffer, $max_players);
		readInt  ($buffer, $region_mask);
		readInt  ($buffer, $version);
		readChar ($buffer, $filter_flag);
		readChar ($buffer, $max_bots);
		readShort($buffer, $min_cpu);
		readChar ($buffer, $buddy_count);

		//Print their request out to the console.
		debugEcho("Got request:\n");
		debugEcho("   Query Flags: $query_flags\n");
		debugEcho("   Key: $key\n");
		debugEcho("   Dummy: $dummy\n");
		debugEcho("   Game Type: $game_type\n");
		debugEcho("   Mission Type: $mission_type\n");
		debugEcho("   Min Players: $min_players\n");
		debugEcho("   Max Players: $max_players\n");
		debugEcho("   Region Mask: $region_mask\n");
		debugEcho("   Version: $version\n");
		debugEcho("   Filter Flag: $filter_flag\n");
		debugEcho("   Max Bots: $max_bots\n");
		debugEcho("   Min CPU: $min_cpu\n");
		debugEcho("   Buddy Count: $buddy_count\n");

		$packettype = 8; //MasterServerListResponse

		//If we have any servers in the list, let them know
		if (count($serverlist)) {
			//Check for old servers
			foreach ($serverlist as $serverinfo) {
				$serveraddress = $serverinfo["Address"];
				$serverport = $serverinfo["Port"];

				//Check for timeout
				if (gettimeofday(true) > $serverinfo["Timestamp"] + $timeout) {

					//Remove the server, it's gone
					$idx = array_search($serverinfo, $serverlist);
					unset($serverlist[$idx]);
					array_splice($serverlist, $idx, 1);
					debugEcho("Removed $serveraddress:$serverport for inactivity\n");

					//And go to the next one
					continue;
				}
			}

			//And spit out the list
			$packettotal = count($serverlist);
			$packetindex = 0;
			foreach ($serverlist as $serverinfo) {
				$serveraddress = $serverinfo["Address"];
				$serverport = $serverinfo["Port"];

				//Check for refresh
				if (gettimeofday(true) > $serverinfo["Timestamp"] + $refresh) {

					//Make sure it's still alive
					socket_sendto($socket, chr(10), 1, 0, $serveraddress, $serverport); //GameMasterInfoRequest

					debugEcho("Sending an info request to $serveraddress:$serverport\n");
				}

				//If the server's address is localhost, then we rewrite it as our IP address
				if ($serveraddress == "127.0.0.1") {
					preg_match("/inet (addr:)?(?!127)(\d+(\.\d+){3})/", `ip addr`, $m);
					$serveraddress = $m[2];
				}

				//IP is separated into 4 chars
				$ipbits = explode(".", $serveraddress);

				//Create the response
				$outbuffer = "";
				writeChar ($outbuffer, $packettype);
				writeChar ($outbuffer, 0);
				writeInt  ($outbuffer, $key);
				writeChar ($outbuffer, $packetindex);
				writeChar ($outbuffer, $packettotal);
				writeShort($outbuffer, $packettotal);
				writeChar ($outbuffer, $ipbits[0]);
				writeChar ($outbuffer, $ipbits[1]);
				writeChar ($outbuffer, $ipbits[2]);
				writeChar ($outbuffer, $ipbits[3]);
				writeShort($outbuffer, $serverport);

				//Iterator
				$packetindex ++;

				//Now send it
				socket_sendto($socket, $outbuffer, strlen($outbuffer), 0, $address, $port);
			}
		} else {
			//No servers, send them a packet with null information
			$packettotal = 1;
			$outbuffer = "";
			writeChar ($outbuffer, $packettype);
			writeChar ($outbuffer, 0);
			writeInt  ($outbuffer, $key);
			writeChar ($outbuffer, 0);
			writeChar ($outbuffer, $packettotal);
			writeShort($outbuffer, 0);
			writeChar ($outbuffer, 0);
			writeChar ($outbuffer, 0);
			writeChar ($outbuffer, 0);
			writeChar ($outbuffer, 0);
			writeShort($outbuffer, 0);

			//Now send it
			socket_sendto($socket, $outbuffer, strlen($outbuffer), 0, $address, $port);
		}

		break;
	case 12: //GameMasterInfoResponse (0x0C)
		//Read all of their data from the buffer, each call mutates $buffer
		readChar ($buffer, $cmd_type);
		readChar ($buffer, $flags);
		readInt  ($buffer, $key);
		readStr  ($buffer, $game_type);
		readStr  ($buffer, $mission_type);
		readChar ($buffer, $max_players);
		readInt  ($buffer, $region_mask);
		readInt  ($buffer, $version);
		readChar ($buffer, $filter_flag);
		readChar ($buffer, $bot_count);
		readInt  ($buffer, $cpu_speed);
		readChar ($buffer, $player_count);
		readGuids($buffer, $guid_list, $player_count);

		//Create an array for their server
		$info = array(
			"GameType" => $game_type,
			"MissionType" => $mission_type,
			"MaxPlayers" => $max_players,
			"RegionMask" => $region_mask,
			"Version" => $version,
			"FilterFlag" => $filter_flag,
			"BotCount" => $bot_count,
			"CPUSpeed" => $cpu_speed,
			"PlayerCount" => $player_count,
			"GuidList" => $guid_list
		);

		$found = false;

		//Check to see if they're already in the list. If so, we just update their info.
		for ($i = 0; $i < count($serverlist); $i ++) {
			if ($serverlist[$i]["Address"] == $address &&
				 $serverlist[$i]["Port"] == $port) {
				//Found it
				debugEcho("Server info from $address:$port\n");

				//Now insert their info
				$serverlist[$i]["Info"] = $info;

				//Update timestamp
				$serverlist[$i]["Timestamp"] = gettimeofday(true);

				$found = true;
				break;
			}
		}

		//If we didn't find them, add them to the list
		if (!$found) {
			$serverlist[] = array("Address" => $address, "Port" => $port, "Timestamp" => gettimeofday(true), "Info" => $info);
			debugEcho("Inserted $address:$port server into server list. List is now " . count($serverlist) . " servers long!\n");
		}

		break;
	case 22: //GameHeartbeat
		//Heartbeat is just going to be an 0x16 (22)

		//Add their server to the list if we haven't yet!
		$found = false;
		//Find their server
		for ($i = 0; $i < count($serverlist); $i ++) {
			if ($serverlist[$i]["Address"] == $address &&
				 $serverlist[$i]["Port"] == $port) {
				//Found it
				$found = true;

				debugEcho("Heartbeat from existing server $address:$port\n");

				//Update timestamp
				$serverlist[$i]["Timestamp"] = gettimeofday(true);

				//Ask for their info
				socket_sendto($socket, chr(10), 1, 0, $address, $port); //GameMasterInfoRequest
				debugEcho("Sending an info request to $address:$port\n");
				break;
			}
		}

		//If we haven't found their server, then they are a new server!
		if (!$found) {
			$serverlist[] = array("Address" => $address, "Port" => $port, "Timestamp" => gettimeofday(true), "Info" => array());
			debugEcho("Inserted $address:$port server into server list. List is now " . count($serverlist) . " servers long!\n");

			//Ask for their info
			socket_sendto($socket, chr(10), 1, 0, $address, $port); //GameMasterInfoRequest
			debugEcho("Sending an info request to $address:$port\n");
		}
		break;
	//The rest of these are various game requests from the client; they're not supported.
	case  2: debugEcho("Cannot handle MasterServerGameTypesRequest (2) requests!\n");  break;
	case  4: debugEcho("Cannot handle MasterServerGameTypesResponse (4) requests!\n"); break;
	case  8: debugEcho("Cannot handle MasterServerListResponse (8) requests!\n");      break;
	case 10: debugEcho("Cannot handle GameMasterInfoRequest (10) requests!\n");        break;
	case 14: debugEcho("Cannot handle GamePingRequest (14) requests!\n");              break;
	case 16: debugEcho("Cannot handle GamePingResponse (16) requests!\n");             break;
	case 18: debugEcho("Cannot handle GameInfoRequest (18) requests!\n");              break;
	case 20: debugEcho("Cannot handle GameInfoResponse (20) requests!\n");             break;
	case 26: debugEcho("Cannot handle ConnectChallengeRequest (26) requests!\n");      break;
	case 28: debugEcho("Cannot handle ConnectChallengeReject (28) requests!\n");       break;
	case 30: debugEcho("Cannot handle ConnectChallengeResponse (30) requests!\n");     break;
	case 32: debugEcho("Cannot handle ConnectRequest (32) requests!\n");               break;
	case 34: debugEcho("Cannot handle ConnectReject (34) requests!\n");                break;
	case 36: debugEcho("Cannot handle ConnectAccept (36) requests!\n");                break;
	case 38: debugEcho("Cannot handle Disconnect (38) requests!\n");                   break;
	default:
		debugEcho("Unknown command ($cmd) sent!");
		break;
	}
}

/**
 * Read a char from the buffer string and store it. Also modifies
 * the buffer to point to the next piece of data.
 * @var data &$buffer The buffer which is read from and forwarded.
 * @var mixed &$store The variable into which the read value is stored
 */
function readChar(&$buffer, &$store) {
	$store = ord($buffer[0]);
	$buffer = substr($buffer, 1);
}

/**
 * Read a short from the buffer string and store it. Also modifies
 * the buffer to point to the next piece of data.
 * @var data &$buffer The buffer which is read from and forwarded.
 * @var mixed &$store The variable into which the read value is stored
 */
function readShort(&$buffer, &$store) {
	$data = unpack("S1result", $buffer);
	$store = $data["result"];
	$buffer = substr($buffer, 2);
}

/**
 * Read an int from the buffer string and store it. Also modifies
 * the buffer to point to the next piece of data.
 * @var data &$buffer The buffer which is read from and forwarded.
 * @var mixed &$store The variable into which the read value is stored
 */
function readInt(&$buffer, &$store) {
	$data = unpack("I1result", $buffer);
	$store = $data["result"];
	$buffer = substr($buffer, 4);
}

/**
 * Read a string from the buffer string and store it. Also modifies
 * the buffer to point to the next piece of data.
 * @var data &$buffer The buffer which is read from and forwarded.
 * @var mixed &$store The variable into which the read value is stored
 */
function readStr(&$buffer, &$store) {
	$len = ord($buffer[0]);
	$store = substr($buffer, 1, $len);
	$buffer = substr($buffer, 1 + $len);
}

/**
 * Read a list of guids from the buffer string and store them. Also modifies
 * the buffer to point to the next piece of data.
 * @var data &$buffer The buffer which is read from and forwarded.
 * @var mixed &$store The variable into which the read value is stored
 */
function readGuids(&$buffer, &$store, $player_count) {
	$store = array();
	while ($player_count --) {
		readInt($buffer, $guid);
		$store[] = $guid;
	}
}

/**
 * Write a char to a buffer, appending the data to the end of the buffer.
 * @var data &$buffer The buffer variable into which the data will be written
 * @var mixed $data The data value to store into the buffer
 */
function writeChar(&$buffer, $data) {
	$buffer .= pack("C1", $data);
}

/**
 * Write a short to a buffer, appending the data to the end of the buffer.
 * @var data &$buffer The buffer variable into which the data will be written
 * @var mixed $data The data value to store into the buffer
 */
function writeShort(&$buffer, $data) {
	$buffer .= pack("S1", $data);
}

/**
 * Write a int to a buffer, appending the data to the end of the buffer.
 * @var data &$buffer The buffer variable into which the data will be written
 * @var mixed $data The data value to store into the buffer
 */
function writeInt(&$buffer, $data) {
	$buffer .= pack("I1", $data);
}

/**
 * Write a str to a buffer, appending the data to the end of the buffer.
 * @var data &$buffer The buffer variable into which the data will be written
 * @var mixed $data The data value to store into the buffer
 */
function writeStr(&$buffer, $data) {
	$buffer .= pack("C1", strlen($data));
	$buffer .= $data;
}

/**
 * Display a socket error and terminate.
 */
function socketError() {
	die("Socket error: [" . socket_last_error() . "] " . socket_strerror(socket_last_error()) . "\n");
}

/**
 * Called on shutdown, this closes the socket
 */
function onShutdown() {
	global $socket;

	//Close the listening socket
	socket_close($socket);
}

/**
 * Print a string if debug is enabled
 * @var string $string The string to print
 */
function debugEcho($string) {
	global $debug;
	if ($debug) {
		echo($string);
	}
}
