import struct
import zlib


class Packet:
    def __init__(self, packet_id, packet_length, string_data, numeric_data, f, checksum) -> None:
        self.id = packet_id
        self.length = packet_length
        self.string_data = string_data
        self.numeric_data = numeric_data
        self.format = f
        self.checksum = checksum

        self.data = struct.pack(f, packet_id, packet_length, string_data, numeric_data, self.checksum)


class ModifyPacket(Packet):
    def __init__(self, packet_id, string_data, numeric_data, data_type) -> None:
        if data_type == "F":
            f = "<BH3sfI"
            check_sum_format = "<3sf"
        else:
            f = "<BH3sII"
            check_sum_format = "<3sI"

        c = zlib.crc32(struct.pack(check_sum_format, bytes(data_type + string_data, 'utf-8'), numeric_data))
        super().__init__(packet_id, 3, bytes(data_type + string_data, 'utf-8'), numeric_data, f, c)

