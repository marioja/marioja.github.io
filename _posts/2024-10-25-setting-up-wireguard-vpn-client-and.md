---
title: "Setting Up a WireGuard VPN: Client and Server Configuration"
date: 2024-10-25 16:36:00 -0400
blogger_url: "https://mfjassociates.blogspot.com/2024/10/setting-up-wireguard-vpn-client-and.html"
---

### Setting Up a WireGuard VPN: Client and Server Configuration

In today's digitally connected world, secure and private communication is paramount. WireGuard is a cutting-edge VPN protocol known for its simplicity and high performance. If you're looking to set up a WireGuard VPN, here's a quick guide on what you need to do for both the client and server sides.

#### Client Configuration

The client configuration is essential for initiating a connection to the WireGuard server. Here’s what you need:

-   WireGuard Client Software: Install the WireGuard client software on your device.
-   Private Key: Generate a private key for the client.
-   Server’s Public Key: Obtain the public key of the server you want to connect to.
-   Configuration File: Create a configuration file (e.g., `client.conf`) with the following settings:

Client

```
PrivateKey = <client_private_key>
Address = 10.0.0.2/24
DNS = 8.8.8.8

[Peer]
PublicKey = <server_public_key>
AllowedIPs = 10.0.0.1/24
Endpoint = <server_endpoint>
```

This file specifies the client’s private key, the server's public key, the IP addresses, and the server endpoint.

#### Server Configuration

The server configuration is crucial for accepting connections from clients. Here’s what you need:

-   WireGuard Server Software: Install the WireGuard server software on your server.
-   Private Key: Generate a private key for the server.
-   Client’s Public Key: Obtain the public key of the client.
-   Configuration File: Create a configuration file (e.g., `server.conf`) with the following settings:

  

```
[Interface]
PrivateKey = <server_private_key>
Address = 10.0.0.1/24
ListenPort = 51820

[Peer]
PublicKey = <client_public_key>
AllowedIPs = 10.0.0.2/24
```

This file specifies the server’s private key, the listening port, and the client’s public key.

#### Additional Considerations

-   PersistentKeepalive: On the client side, this setting helps maintain the connection behind NAT. Add `PersistentKeepalive = 25` to the `[Peer]` section.
-   Firewall Rules: Ensure your firewall allows traffic on the WireGuard port (default: 51820).
-   Routing: Make sure your routing tables are configured correctly to route traffic through the VPN tunnel.

#### Conclusion

Setting up a WireGuard VPN involves configuring both the client and server sides with the appropriate keys and settings. By following these steps, you can create a secure and efficient VPN connection that ensures private and encrypted communication.

You can note that a client peer definition always comes with an Endpoint and the interface does not contain a ListenPort.  This is not to say that two computer cannot both have a listening interface and a both have a client peer.  This means that this interface can act both to receive connections and to initiate connections.  
  
Happy VPN using WireGuard.
