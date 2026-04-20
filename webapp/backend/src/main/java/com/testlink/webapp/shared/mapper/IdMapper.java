package com.testlink.webapp.shared.mapper;

import com.testlink.webapp.shared.util.IdUtil;
import org.mapstruct.Mapper;

import java.util.UUID;

@Mapper(componentModel = "spring")
public class IdMapper {

    public String map(UUID uuid) {
        return IdUtil.toBase62(uuid);
    }
}