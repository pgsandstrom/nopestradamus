package se.persandstrom.nopestradamus.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import se.persandstrom.nopestradamus.db.dao.PredictionDao;
import se.persandstrom.nopestradamus.db.dao.PredictionVersionDao;
import se.persandstrom.nopestradamus.db.entity.Prediction;
import se.persandstrom.nopestradamus.db.entity.PredictionVersion;
import se.persandstrom.nopestradamus.dto.PredictionDto;

@Controller
public class Api {

	@Autowired PredictionDao predictionDao;
	@Autowired PredictionVersionDao predictionVersionDao;

	@RequestMapping(value = "/prediction/new", method = RequestMethod.POST)
	String createPrediction(@RequestBody PredictionDto predictionDto) {
		System.out.println("title 1: " + predictionDto);
		System.out.println("title 2: " + predictionDto.getTitle());
		return "ok";
	}

	@RequestMapping("/test/{id}")
	@ResponseBody
	String test(@PathVariable("id") String id, @RequestParam("plox") String plox) {
		return id + " " + plox;
	}

	@RequestMapping("/get")
	@ResponseBody
	String get() {
		return predictionDao.getAll().toString();
	}

	@RequestMapping(value = "/save", method = RequestMethod.POST)
	@ResponseBody
	String save() {
		PredictionVersion newPrediction = new PredictionVersion("Hej");
		Prediction prediction = new Prediction(newPrediction);
		predictionDao.addPrediction(prediction);
		prediction.getPredictions().forEach(predictionVersion -> predictionVersionDao.addPredictionVersion(predictionVersion));
		return "saved";
	}
}
