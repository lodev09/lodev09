<?php

namespace Models;

class Profile extends Model {

	public function get_fullname() {
		return $this->firstname.' '.$this->lastname;
	}

	public function get_links() {
		return Link::query("SELECT * FROM links WHERE profile_id = :profile_id", ['profile_id' => $this->id]);
	}

}