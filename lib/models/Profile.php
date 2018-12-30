<?php

namespace Models;

class Profile extends Model {

	public function get_fullname() {
		return $this->firstname.' '.$this->lastname;
	}

	public function get_links() {
		return Link::query("SELECT * FROM links WHERE profile_id = :profile_id", ['profile_id' => $this->id]);
	}

	public function get_gravatar($size = 100) {
		$gravatar = new \Common\Gravatar($this->email, $size);
		return $gravatar->get_url();
	}

}