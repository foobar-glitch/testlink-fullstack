package com.testlink.webapp.user.mapper;

import com.testlink.webapp.shared.mapper.TimeStampMapper;
import com.testlink.webapp.user.dto.AuthorityDTO;
import com.testlink.webapp.user.entity.Authority;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;

@Mapper(
        componentModel = "spring",
        uses = TimeStampMapper.class,
        implementationName = "AuthorityMapperImpl"
)
public interface AuthorityMapper {

    @Mapping(target = "authorityId", source = "authorityId")
    @Mapping(target = "authority", source = "authority")
    @Mapping(target = "timeStamp", source = ".")
    AuthorityDTO toDto(Authority authority);

    Set<AuthorityDTO> toDtoSet(Set<Authority> authorities);
}