package com.nbti.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.nbti.dto.ChatDTO;

@Repository
public class ChatDAO {

	@Autowired
	private SqlSession mybatis;
	
	public ChatDTO insert(ChatDTO dto) throws Exception {
		mybatis.insert("Chat.insert",dto);
		dto.setWrite_date(mybatis.selectOne("Chat.date",dto.getSeq()));
		return dto;
	}
	
	public List<ChatDTO> list() throws Exception{
		return mybatis.selectList("Chat.list");
	}
	
	public List<ChatDTO> search(String content) throws Exception{
		return mybatis.selectList("Chat.search",content);
	}
}