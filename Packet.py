import struct
import zlib


class Packet:
    def __init__(self, packet_id, packet_length, string_data, numeric_data, f) -> None:
        self.id = packet_id
        self.length = packet_length
        self.string_data = string_data
        self.numeric_data = numeric_data
        self.format = f
        check_sum_format = "<{}sf".format(packet_length)
        checksum = zlib.crc32(struct.pack(check_sum_format, string_data, numeric_data))
        self.data = struct.pack(f, packet_id, packet_length, string_data, numeric_data, checksum)


class ModifyPacket(Packet):
    def __init__(self, packet_id, packet_length, string_data, numeric_data) -> None:
        f = "<BH" + str(packet_length) + 'sfI'
        super().__init__(packet_id, packet_length, string_data, numeric_data, f)
